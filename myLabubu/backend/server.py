from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os

from pydub import AudioSegment  # convert webm -> wav
import soundfile as sf          # for duration logging
from gameJudger import analyze_single_player

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "http://localhost:5173",
        # "http://127.0.0.1:5173",
        "https://www.awwsheet.ink",
        "https://canes-chicken.vercel.app.ink",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyzeSinglePlayer")
async def analyze_single_player_endpoint(
    song_key: str = Form(...),
    player_audio: UploadFile = File(...),
):
    # 1. save uploaded file (webm/opus) to a temp .webm on disk
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
        raw_bytes = await player_audio.read()
        tmp_in.write(raw_bytes)
        webm_path = tmp_in.name

    # 2. create an output temp .wav path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_out:
        wav_path = tmp_out.name

    # 3. transcode webm -> wav using pydub+ffmpeg
    try:
        audio_seg = AudioSegment.from_file(webm_path, format="webm")
        # force mono + stable sample rate
        audio_seg = audio_seg.set_channels(1).set_frame_rate(22050)
        audio_seg.export(wav_path, format="wav")
    except Exception as e:
        # cleanup temps on error
        try:
            os.remove(webm_path)
        except:
            pass
        try:
            os.remove(wav_path)
        except:
            pass
        raise e  # FastAPI will turn this into a 500

    # 4. run pitch/score analysis on the wav
    try:
        result = analyze_single_player(wav_path, song_key=song_key)

        # ---- DEBUG LOGGING START ----
        # get clip duration in seconds (reading the wav we just made)
        try:
            audio_data, sr = sf.read(wav_path)
            dur_sec = float(len(audio_data) / sr)
        except Exception as dur_err:
            dur_sec = -1.0
            print("WARNING: could not compute duration:", dur_err)

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
        # ---- DEBUG LOGGING END ----

    finally:
        # 5. cleanup temp files no matter what
        try:
            os.remove(webm_path)
        except:
            pass
        try:
            os.remove(wav_path)
        except:
            pass

    # 6. return JSON back to frontend
    return {
        "notes": result["notes"],
        "accuracy": result["accuracy"],
        "score": result["score"],
    }