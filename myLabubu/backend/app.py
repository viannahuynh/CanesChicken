import io, os, tempfile, base64, subprocess, shutil
import numpy as np
import soundfile as sf
import librosa
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from music21 import stream, note, meter, tempo, key as m21key, interval, pitch, clef
from pydub import AudioSegment            
from gameJudger import analyze_single_player  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://www.awwsheet.ink",
        "https://canes-chicken.vercel.app.ink",
        "https://caneschicken.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def note_to_name_octave(n: note.Note) -> tuple[str, int]:
    step = n.pitch.step
    acc = n.pitch.accidental
    octv = n.pitch.octave
    acc_txt = ''
    if acc is not None:
        if acc.alter == 1.0:
            acc_txt = '#'
        elif acc.alter == -1.0:
            acc_txt = 'b'
        elif acc.alter == 2.0:
            acc_txt = '##'
        elif acc.alter == -2.0:
            acc_txt = 'bb'
    return f'{step}{acc_txt}', int(octv if octv is not None else 4)

def sanitize_note_name(name: str) -> str:
    if not name:
        return name
    return (
        name.replace("𝄪", "##")
            .replace("𝄫", "bb")
            .replace("♯", "#")
            .replace("♭", "b")
    )

def ensure_ffmpeg():
    if not shutil.which("ffmpeg"):
        raise HTTPException(
            status_code=500,
            detail="ffmpeg not found. Install it (e.g., `brew install ffmpeg`) and restart."
        )

def transcode_to_wav_bytes(raw_bytes: bytes, in_ext: str, target_sr: int = 22050) -> bytes:
    ensure_ffmpeg()
    try:
        with tempfile.TemporaryDirectory() as tmp:
            inp = os.path.join(tmp, f"in.{in_ext}")
            out = os.path.join(tmp, "out.wav")
            with open(inp, "wb") as f:
                f.write(raw_bytes)
            cmd = ["ffmpeg", "-y", "-i", inp, "-ar", str(target_sr), "-ac", "1", out]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            with open(out, "rb") as f:
                return f.read()
    except subprocess.CalledProcessError as e:
        err = e.stderr.decode(errors="ignore")[:600]
        raise HTTPException(status_code=400, detail=f"ffmpeg failed: {err}")

# ---------- RHYTHM POLICY: only these note values, no ties ----------
ALLOWED_DURS = [4.0, 2.0, 1.5, 1.0]   # whole, half, dotted-quarter, quarter

def pick_allowed_duration(raw_q: float, strategy: str = "nearest") -> float:
    arr = np.array(ALLOWED_DURS, dtype=float)
    if strategy == "floor":
        candidates = arr[arr <= raw_q + 1e-9]
        return float(candidates.max() if candidates.size else arr.min())
    elif strategy == "ceil":
        candidates = arr[arr >= raw_q - 1e-9]
        return float(candidates.min() if candidates.size else arr.max())
    else:  # nearest
        return float(arr[np.argmin(np.abs(arr - raw_q))])

def split_across_measures_no_tie(qlen: float, pos_in_measure: float) -> list[tuple[str, float]]:
    """
    Split a logical duration so it never crosses a barline.
    Returns [(kind, qlen)] where kind ∈ {'note','rest'}.
    If < 1 beat remains in the current measure, insert a rest to move to next bar.
    """
    out: list[tuple[str, float]] = []
    remaining_in_measure = 4.0 - (pos_in_measure % 4.0)

    if remaining_in_measure < 1.0:
        out.append(("rest", remaining_in_measure))
        qlen_left = qlen
        while qlen_left > 0:
            chunk = min(qlen_left, 4.0)
            out.append(("note", chunk))
            qlen_left -= chunk
        return out

    chunk = min(qlen, remaining_in_measure)
    out.append(("note", chunk))
    q_left = qlen - chunk

    while q_left > 0:
        chunk2 = min(q_left, 4.0)
        out.append(("note", chunk2))
        q_left -= chunk2

    return out

# ---------- analysis (PITCH UNCHANGED, RHYTHM REWRITTEN) ----------
def analyze_to_stream(
    wav_bytes: bytes,
    quantize_divisions: int = 8,          # ignored (kept for compatibility)
    quantize_strategy: str = "nearest",   # "nearest" | "floor" | "ceil"
    bpm_override: float | None = None,    # optional tempo spelling
):
    y, sr = sf.read(io.BytesIO(wav_bytes))
    if y.ndim > 1:
        y = y[:, 0]

    # cleanup
    y = librosa.util.normalize(y)
    y = librosa.effects.remix(y, intervals=librosa.effects.split(y, top_db=30))

    # tempo detection
    tempo_est, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beats_t = librosa.frames_to_time(beat_frames, sr=sr)
    if beats_t.size >= 2:
        ibI = np.diff(beats_t)
        tempo_est = float(60.0 / np.median(ibI))
    if not np.isfinite(tempo_est) or tempo_est < 40 or tempo_est > 300:
        tempo_est = 120.0

    tempo_used = float(bpm_override) if (bpm_override is not None and 30.0 <= bpm_override <= 300.0) else float(tempo_est)
    q_sec = 60.0 / tempo_used

    # onsets (preserve segmentation; no snapping/merging)
    on_frames = librosa.onset.onset_detect(
        y=y, sr=sr, units="frames", backtrack=True,
        pre_max=30, post_max=30, pre_avg=40, post_avg=40, delta=0.07, wait=12
    )
    on_times = librosa.frames_to_time(on_frames, sr=sr)
    total_t = librosa.get_duration(y=y, sr=sr)

    # cuts = start + onsets + end
    cuts = np.unique(np.concatenate([[0.0], on_times, [total_t]])).tolist()
    cuts = [t for t in cuts if 0.0 <= t <= total_t + 1e-6]
    cuts.sort()

    # stream: treble, 4/4, allowed durations, NO ties
    s = stream.Stream()
    s.append(tempo.MetronomeMark(number=tempo_used))
    s.append(meter.TimeSignature("4/4"))
    s.append(clef.TrebleClef())

    pos_in_measure = 0.0 

    for i in range(len(cuts) - 1):
        t0, t1 = cuts[i], cuts[i + 1]
        seg = y[int(t0 * sr):int(t1 * sr)]

        dur_q_raw = (t1 - t0) / q_sec
        qlen_allowed = pick_allowed_duration(dur_q_raw, quantize_strategy)

        if len(seg) < int(0.01 * sr):
            pieces = split_across_measures_no_tie(qlen_allowed, pos_in_measure)
            for _, ql in pieces:
                s.append(note.Rest(quarterLength=ql))
                pos_in_measure = (pos_in_measure + ql) % 4.0
            continue

        f0 = librosa.yin(seg, fmin=librosa.note_to_hz("G3"), fmax=librosa.note_to_hz("E7"), sr=sr)
        f0 = f0[np.isfinite(f0)]

        if f0.size == 0:
            pieces = split_across_measures_no_tie(qlen_allowed, pos_in_measure)
            for _, ql in pieces:
                s.append(note.Rest(quarterLength=ql))
                pos_in_measure = (pos_in_measure + ql) % 4.0
        else:
            hz = float(np.median(f0))
            pname = sanitize_note_name(librosa.hz_to_note(hz))
            try:
                if note.Note(pname).pitch.midi < note.Note("G3").pitch.midi:
                    pname = "G3"
            except Exception:
                pname = "G3"

            pieces = split_across_measures_no_tie(qlen_allowed, pos_in_measure)
            for kind, ql in pieces:
                if kind == "rest":
                    s.append(note.Rest(quarterLength=ql))
                else:
                    s.append(note.Note(pname, quarterLength=ql))  # NO ties added
                pos_in_measure = (pos_in_measure + ql) % 4.0

    # key detection
    try:
        k = s.analyze("Krumhansl")
        s.insert(0, m21key.Key(k.tonic.name, k.mode))
        key_text = f"{k.tonic.name} {k.mode}"
    except Exception:
        s.insert(0, m21key.Key("C", "major"))
        key_text = "C major"

    s.makeMeasures(inPlace=True)
    s.makeNotation(inPlace=True, meterStream=s.recurse().getElementsByClass(meter.TimeSignature))

    notes_list = []
    for el in s.flat.notes:
        nm, oc = note_to_name_octave(el)
        notes_list.append({"note": nm, "octave": oc, "duration_q": float(el.quarterLength)})

    return s, key_text, float(tempo_used), notes_list

def export_stream(s: stream.Stream):
    xml_path = s.write("musicxml")
    midi_path = s.write("midi")
    with open(xml_path, "rb") as f:
        xml_str = f.read().decode("utf-8", errors="ignore")
    with open(midi_path, "rb") as f:
        midi_b64 = base64.b64encode(f.read()).decode("utf-8")
    return xml_str, midi_b64

def compute_transpose_interval(from_key_text: str, to_key_text: str):
    try:
        fk_parts = from_key_text.split()
        tk_parts = to_key_text.split()
        fk_tonic = fk_parts[0]
        tk_tonic = tk_parts[0]
        i = interval.Interval(pitch.Pitch(fk_tonic), pitch.Pitch(tk_tonic))
        return i
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not compute transpose interval: {e}")

## Endpoints
@app.get("/")
def root():
    return {
        "status": "ok",
        "endpoints": [
            "/api/transcribe-and-transpose",
            "/analyzeSinglePlayer",
            "/docs",
        ],
    }


@app.post("/api/transcribe-and-transpose")
async def transcribe_and_transpose(
    audio: UploadFile = File(...),
    target_key: str = Form(default=""),
    semitones: int = Form(default=0),
    # rhythm controls
    quantize_divisions: int = Form(default=8),        # kept for compatibility; ignored
    quantize_strategy: str = Form(default="nearest"), # "nearest" | "floor" | "ceil"
    bpm_override: float | None = Form(default=None),
):
    raw = await audio.read()

    # detect extension
    ext = "webm"
    if audio.filename and "." in audio.filename:
        ext = audio.filename.rsplit(".", 1)[1].lower()
    elif audio.content_type and "/" in audio.content_type:
        ext = audio.content_type.split("/", 1)[1].lower()

    wav_bytes = transcode_to_wav_bytes(raw, ext)
    base_stream, detected_key, bpm, notes_list = analyze_to_stream(
        wav_bytes,
        quantize_divisions=quantize_divisions,
        quantize_strategy=quantize_strategy,
        bpm_override=bpm_override,
    )

    orig_xml, orig_midi = export_stream(base_stream)

    # transposed
    if target_key:
        i = compute_transpose_interval(detected_key, target_key)
        transposed_stream = base_stream.transpose(i)
        tk_parts = target_key.split()
        tk_tonic = tk_parts[0]
        tk_mode = tk_parts[1] if len(tk_parts) > 1 else "major"
        transposed_stream.insert(0, m21key.Key(tk_tonic, tk_mode))
        t_key_text = target_key
    elif semitones != 0:
        transposed_stream = base_stream.transpose(semitones)
        t_key_text = f"{detected_key} ({'+' if semitones > 0 else ''}{semitones} st)"
    else:
        transposed_stream = base_stream
        t_key_text = detected_key

    trans_xml, trans_midi = export_stream(transposed_stream)

    return JSONResponse({
        "detectedKey": detected_key,
        "targetKey": t_key_text,
        "bpm": bpm,
        "timeSignature": "4/4",
        "notes": notes_list,
        "original": {"musicxml": orig_xml, "midiB64": orig_midi},
        "transposed": {"musicxml": trans_xml, "midiB64": trans_midi},
    })

# --- Game endpoint (from your server.py) ---
@app.post("/analyzeSinglePlayer")
async def analyze_single_player_endpoint(
    song_key: str = Form(...),
    player_audio: UploadFile = File(...),
):
    ensure_ffmpeg()  # pydub also needs ffmpeg

    # 1) write upload to temp webm
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
        raw_bytes = await player_audio.read()
        tmp_in.write(raw_bytes)
        webm_path = tmp_in.name

    # 2) make temp wav path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_out:
        wav_path = tmp_out.name

    # 3) transcode webm -> wav (mono, 22050)
    try:
        audio_seg = AudioSegment.from_file(webm_path, format="webm")
        audio_seg = audio_seg.set_channels(1).set_frame_rate(22050)
        audio_seg.export(wav_path, format="wav")
    except Exception as e:
        try: os.remove(webm_path)
        except: pass
        try: os.remove(wav_path)
        except: pass
        raise e

    # 4) run your analyzer
    try:
        result = analyze_single_player(wav_path, song_key=song_key)

        # optional debug
        try:
            audio_data, sr = sf.read(wav_path)
            dur_sec = float(len(audio_data) / sr)
        except Exception:
            dur_sec = -1.0

        print("---- analyzeSinglePlayer DEBUG ----")
        print(f"song_key: {song_key}")
        print(f"uploaded filename: {player_audio.filename}")
        print(f"raw upload size (bytes): {len(raw_bytes)}")
        print(f"temp webm path: {webm_path}")
        print(f"temp wav  path: {wav_path}")
        print(f"audio duration (sec): {dur_sec:.3f}")
        print(f"analysis.notes: {result.get('notes')}")
        print(f"analysis.accuracy: {result.get('accuracy')}")
        print(f"analysis.score: {result.get('score')}")
        print("-----------------------------------")
    finally:
        # 5) clean up temps
        try: os.remove(webm_path)
        except: pass
        try: os.remove(wav_path)
        except: pass

    # 6) return JSON
    return {
        "notes": result["notes"],
        "accuracy": result["accuracy"],
        "score": result["score"],
    }
