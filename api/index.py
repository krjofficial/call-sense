import os
import sys
import json
import tempfile

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Allow imports from project root
sys.path.append(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

from transcribe import translate_audio
from extractor import extract_insights


app = FastAPI()


# -------------------------
# Paths
# -------------------------

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

FRONTEND_DIR = os.path.join(
    PROJECT_ROOT,
    "frontend"
)

CALLS_DIR = os.path.join(
    PROJECT_ROOT,
    "calls"
)

DATA_DIR = os.path.join(
    PROJECT_ROOT,
    "data"
)

ANALYSES_FILE = os.path.join(
    DATA_DIR,
    "analyses.json"
)


# -------------------------
# Helpers
# -------------------------

def load_analyses():

    if not os.path.exists(ANALYSES_FILE):
        return []

    with open(
        ANALYSES_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        return json.load(f)


def save_analyses(analyses):

    os.makedirs(
        DATA_DIR,
        exist_ok=True
    )

    with open(
        ANALYSES_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            analyses,
            f,
            indent=2,
            ensure_ascii=False
        )


# -------------------------
# Health
# -------------------------

@app.get("/api/health")
def health():

    return {
        "status": "ok"
    }


# -------------------------
# Get stored analyses
# -------------------------

@app.get("/api/calls")
def get_calls():

    return load_analyses()


# -------------------------
# Analyze uploaded call
# -------------------------

@app.post("/api/analyze")
async def analyze_call(
    file: UploadFile = File(...)
):

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".mp3"
    ) as tmp:

        tmp.write(
            await file.read()
        )

        tmp_path = tmp.name

    try:

        # Translate audio
        translated = translate_audio(
            tmp_path
        )

        # Extract insights
        result = extract_insights(
            translated.text,
            translated.language
        )

        analysis = {

            "filename": file.filename,

            "original_language":
                translated.language,

            "english_transcript":
                translated.text,

            "insights":
                result.model_dump()
        }

        # Load existing analyses
        analyses = load_analyses()

        # Remove old analysis for same filename
        analyses = [
            item
            for item in analyses
            if item["filename"] != file.filename
        ]

        # Add new analysis
        analyses.append(
            analysis
        )

        # Save
        save_analyses(
            analyses
        )

        return analysis

    finally:

        if os.path.exists(
            tmp_path
        ):

            os.remove(
                tmp_path
            )


# -------------------------
# Analyze all calls
# -------------------------

@app.post("/api/analyze-all")
def analyze_all_calls():

    analyses = load_analyses()

    existing = {
        item["filename"]
        for item in analyses
    }

    results = []

    if not os.path.exists(
        CALLS_DIR
    ):

        return {
            "message": "Calls folder does not exist",
            "results": []
        }

    for filename in os.listdir(
        CALLS_DIR
    ):

        if not filename.lower().endswith(
            (
                ".mp3",
                ".wav",
                ".m4a",
                ".ogg",
                ".flac"
            )
        ):

            continue

        # Skip already analyzed calls
        if filename in existing:
            continue

        file_path = os.path.join(
            CALLS_DIR,
            filename
        )

        try:

            translated = translate_audio(
                file_path
            )

            result = extract_insights(
                translated.text,
                translated.language
            )

            analysis = {

                "filename": filename,

                "original_language":
                    translated.language,

                "english_transcript":
                    translated.text,

                "insights":
                    result.model_dump()
            }

            analyses.append(
                analysis
            )

            results.append(
                analysis
            )

        except Exception as e:

            results.append({
                "filename": filename,
                "error": str(e)
            })

    save_analyses(
        analyses
    )

    return {
        "message": "Analysis complete",
        "results": results
    }


# -------------------------
# Frontend
# -------------------------

@app.get("/")
def serve_frontend():

    return FileResponse(
        os.path.join(
            FRONTEND_DIR,
            "index.html"
        )
    )


app.mount(
    "/frontend",
    StaticFiles(
        directory=FRONTEND_DIR
    ),
    name="frontend"
)