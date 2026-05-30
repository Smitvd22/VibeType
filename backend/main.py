import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile

app = FastAPI(title="VibeType STT API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
# Using 'tiny' or 'base' for faster CPU inference. 
# 'compute_type="int8"' is great for reducing memory and speeding up CPU.
# Render free tier might struggle with large models, 'tiny' is safest for free tier.
model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.post("/api/stt")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("en") # Default to english, but customizable for scaling
):
    """
    Transcribes audio to text using faster-whisper.
    Accepts an audio file and an optional language code.
    """
    # Save uploaded file to a temporary location
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(await file.read())
            temp_path = temp_audio.name
        
        # Transcribe
        # language can be None for auto-detect, or a specific string like 'en', 'es', 'fr'
        segments, info = model.transcribe(
            temp_path,
            beam_size=5,
            language=language if language != "auto" else None
        )
        
        transcript = ""
        for segment in segments:
            transcript += segment.text + " "
            
        return {
            "transcript": transcript.strip(),
            "language_detected": info.language,
            "language_probability": info.language_probability
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Cleanup
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": model_size}
