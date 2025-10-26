import numpy as np
import librosa
from scipy.ndimage import median_filter

########################################
# SONG DEFINITIONS / REFERENCE MELODIES
########################################

# This is the "correct" violin line for Happy Birthday in D major
# based on the sheet you showed (starts on D4, includes F#4, etc.).
HAPPY_BIRTHDAY_NOTES = [
    "D4","D4","E4","D4","G4","F#4",
    "D4","D4","E4","D4","A4","G4",
    "D4","D4","D4","B4","A4","G4",
    "F#4","C4","C4","B4","G4","A4","G4"
]


# You can add more songs later:
# TWINKLE_TWINKLE = [ ... ]
# MARY_HAD_A_LITTLE_LAMB = [ ... ]

SONGS = {
    "happy_birthday": HAPPY_BIRTHDAY_NOTES,
    # "twinkle": TWINKLE_TWINKLE,
    # "mary": MARY_HAD_A_LITTLE_LAMB,
}


########################################
# NOTE NAME HELPERS
########################################

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def hz_to_note_info(freq_hz):
    """
    Convert frequency (Hz) -> musical note info.
    Returns a dict:
    {
        "note": "D4",
        "midi": 62,
        "cents_off": -4.2,
        "freq_hz": 293.1
    }
    """
    if freq_hz is None or freq_hz <= 0 or np.isnan(freq_hz):
        return None

    # Map frequency to MIDI note number.

    midi_exact = 69 + 12 * np.log2(freq_hz / 440.0)

    midi_round = int(round(midi_exact))
    cents_off = (midi_exact - midi_round) * 100.0

    note_name = NOTE_NAMES[midi_round % 12]
    octave = (midi_round // 12) - 1

    return {
        "note": f"{note_name}{octave}",
        "midi": midi_round,
        "cents_off": cents_off,
        "freq_hz": freq_hz,
    }

def correct_violin_register(freq_hz, low_ok=200.0):
    """
    pyin sometimes guesses an integer subharmonic (half the true pitch, etc.),
    which makes a violin D4 (~293 Hz) look like ~146 Hz, which is wrong.

    Tuning tip:
    - If you're analyzing only high violin notes, you can raise low_ok.
    - If you're analyzing lower strings or cello, lower low_ok.
    """
    if freq_hz is None or np.isnan(freq_hz) or freq_hz <= 0:
        return freq_hz

    candidates = [freq_hz, freq_hz * 2, freq_hz * 3, freq_hz * 4]
    for c in candidates:
        if c >= low_ok:
            return c
    return freq_hz


########################################
# CORE PITCH TRACKING + SEGMENTING
########################################

def analyze_violin_notes(
    audio_path,
    fmin_note="C3",
    fmax_note="A6",
    frame_length=4096,
    hop_length=512,
    voiced_prob_threshold=0.3,
    min_segment_len_sec=0.05,
    note_change_cents_tolerance=40,
    low_ok_for_register=200.0,
):
    """
    Take an audio file path (wav/webm/etc), extract monophonic pitch over time,
    smooth it, merge it into note segments, and return a list of segments.

    Returns a list like:
    [
      { "note": "D4", "start_s": 0.00, "end_s": 0.42, "dur_s": 0.42 },
      { "note": "D4", "start_s": 0.42, "end_s": 0.80, "dur_s": 0.38 },
      { "note": "E4", "start_s": 0.80, "end_s": 1.30, "dur_s": 0.50 },
      ...
    ]
    """

    # 1. Load audio (mono, keep original sr)
    y, sr = librosa.load(audio_path, sr=None, mono=True)

    # 2. Estimate pitch curve using pyin
    #    fmin/fmax are bounds in Hz derived from musical note names
    f0, voiced_flag, voiced_prob = librosa.pyin(
        y,
        fmin=librosa.note_to_hz(fmin_note),
        fmax=librosa.note_to_hz(fmax_note),
        frame_length=frame_length,
        hop_length=hop_length,
    )
    # f0: array of floats (Hz) or np.nan
    # voiced_flag: array of booleans (is this frame voiced?)
    # voiced_prob: array of confidences [0..1]

    # time for each frame
    times = librosa.frames_to_time(
        np.arange(len(f0)),
        sr=sr,
        hop_length=hop_length
    )

    # 3. Keep only confidently voiced frames (rest -> NaN)
    conf_mask = (voiced_flag == True) & (voiced_prob >= voiced_prob_threshold)
    f0_clean = np.where(conf_mask, f0, np.nan)

    # 4. Smooth pitch with median filter to reduce jitter/vibrato splits.
    f0_smooth = f0_clean.copy()
    valid_idx = ~np.isnan(f0_clean)
    if np.any(valid_idx):
        tmp = f0_clean.copy()
        tmp[~valid_idx] = 0.0
        tmp_filtered = median_filter(tmp, size=5)
        tmp_filtered[~valid_idx] = np.nan
        f0_smooth = tmp_filtered

    # 5. Convert each frame freq -> corrected pitch -> note info dict
    frame_notes = []
    for t, raw_freq in zip(times, f0_smooth):
        if np.isnan(raw_freq):
            frame_notes.append(None)
        else:
            adj_freq = correct_violin_register(raw_freq, low_ok=low_ok_for_register)
            frame_notes.append(hz_to_note_info(adj_freq))

    # 6. Merge consecutive frames that represent "the same note"
    #    We'll tolerate small cents drift so vibrato doesn't split notes.
    segments = []
    if any(n is not None for n in frame_notes):
        curr_start_t = None
        curr_end_t = None
        curr_ref_note = None      # (midi_ref, cents_ref)
        curr_note_name = None     # e.g. "D4"

        def is_same_note(prev_ref, curr_candidate, tolerance_cents):
            if prev_ref is None or curr_candidate is None:
                return False
            midi_ref, cents_ref = prev_ref
            if curr_candidate["midi"] != midi_ref:
                return False
            cents_diff = abs(curr_candidate["cents_off"] - cents_ref)
            return cents_diff <= tolerance_cents

        for t, n in zip(times, frame_notes):
            if n is None:
                # pitch dropped / unconfident -> close current segment if open
                if curr_start_t is not None:
                    segments.append({
                        "note": curr_note_name,
                        "start_s": curr_start_t,
                        "end_s": curr_end_t
                    })
                    curr_start_t = None
                    curr_end_t = None
                    curr_ref_note = None
                    curr_note_name = None
                continue

            if curr_start_t is None:
                # start new segment
                curr_start_t = t
                curr_end_t = t
                curr_ref_note = (n["midi"], n["cents_off"])
                curr_note_name = n["note"]
            else:
                # same vs new note?
                if is_same_note(curr_ref_note, n, note_change_cents_tolerance):
                    curr_end_t = t
                else:
                    # end previous segment
                    segments.append({
                        "note": curr_note_name,
                        "start_s": curr_start_t,
                        "end_s": curr_end_t
                    })
                    # start new one
                    curr_start_t = t
                    curr_end_t = t
                    curr_ref_note = (n["midi"], n["cents_off"])
                    curr_note_name = n["note"]

        # close trailing open segment
        if curr_start_t is not None:
            segments.append({
                "note": curr_note_name,
                "start_s": curr_start_t,
                "end_s": curr_end_t
            })

    # 7. Filter out tiny blips (bow squeaks, coughs, partial frames)
    cleaned_segments = []
    for seg in segments:
        dur_s = seg["end_s"] - seg["start_s"]
        if dur_s >= min_segment_len_sec:
            cleaned_segments.append({
                "note": seg["note"],
                "start_s": seg["start_s"],
                "end_s": seg["end_s"],
                "dur_s": dur_s
            })

    return cleaned_segments


########################################
# SEQUENCE + SCORING
########################################

def segments_to_note_sequence(cleaned_segments):
    """
    Take cleaned_segments like:
       [{"note":"D4","start_s":0.0,"end_s":0.4,"dur_s":0.4}, ...]
    and reduce to just the ordered notes:
       ["D4","D4","E4","D4","G4","F#4", ...]
    """
    return [seg["note"] for seg in cleaned_segments]


def score_player(player_notes, target_notes):
    """
    Compare player's detected note sequence to target melody.
    Very first version: position-by-position match.

    Returns a float accuracy between 0.0 and 1.0.
    """
    if len(player_notes) == 0:
        return 0.0

    L = min(len(player_notes), len(target_notes))
    correct = 0
    for i in range(L):
        if player_notes[i] == target_notes[i]:
            correct += 1

    return correct / L


########################################
# HIGH-LEVEL HELPER FOR ONE PLAYER
########################################

def analyze_single_player(audio_path, song_key="happy_birthday"):
    """
    High-level API for the frontend.

    1. Run pitch analysis on the player's audio.
    2. Convert to note sequence.
    3. Compare with the reference melody for `song_key`.
    4. Return a dict of results that the frontend can display.

    Returns:
    {
      "notes":    ["D4","D4","E4",...],
      "accuracy": 0.82,          # fraction 0..1
      "score":    823            # e.g. accuracy * 1000
    }
    """

    # 1. detect note segments from audio
    segments = analyze_violin_notes(
        audio_path,
        fmin_note="C3",
        fmax_note="A6",
        frame_length=4096,
        hop_length=512,
        voiced_prob_threshold=0.3,
        min_segment_len_sec=0.05,
        note_change_cents_tolerance=40,
        low_ok_for_register=200.0,
    )

    # 2. flatten to note sequence like ["D4","D4","E4",...]
    player_notes = segments_to_note_sequence(segments)

    # 3. get the official target notes (ground truth)
    if song_key not in SONGS:
        raise ValueError(f"Unknown song_key '{song_key}'. Available: {list(SONGS.keys())}")
    target_notes = SONGS[song_key]

    # 4. score (0.0-1.0)
    accuracy_ratio = score_player(player_notes, target_notes)

    # 5. turn that into a 'score' number for fun / leaderboards
    score_points = int(round(accuracy_ratio * 1000))

    return {
        "notes": player_notes,
        "accuracy": accuracy_ratio,
        "score": score_points,
    }



if __name__ == "__main__":
    TEST_FILE = "happy_birthday_violin_test.wav"  # change this to any clip you want
    TEST_FILE_WRONG = "happy_birthday_wrong_test.wav"


    result = analyze_single_player(TEST_FILE, song_key="happy_birthday")
    result2 = analyze_single_player(TEST_FILE_WRONG,song_key="happy_birthday")
    print("Detected notes:", result["notes"])
    print("Accuracy:", round(result["accuracy"] * 100, 1), "%")
    print("Score:", result["score"])

    print("Detected notes:", result2["notes"])
    print("Accuracy:", round(result2["accuracy"] * 100, 1), "%")
    print("Score:", result2["score"])