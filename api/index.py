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
    print("====================================")
    print("ANALYZE REQUEST RECEIVED")
    print("Filename:", file.filename)
    print("====================================")

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".mp3"
    ) as tmp:

        audio_data = await file.read()

        print("Uploaded bytes:", len(audio_data))

        tmp.write(audio_data)

        tmp_path = tmp.name

    try:

        print("STEP 1: Starting Groq translation...")

        translated = translate_audio(
            tmp_path
        )

        print("STEP 1 COMPLETE")
        print("Language:", getattr(translated, "language", "unknown"))
        print(
            "Transcript length:",
            len(translated.text)
        )

        print("STEP 2: Starting LLM extraction...")

        result = extract_insights(
            translated.text,
            translated.language
        )

        print("STEP 2 COMPLETE")

        analysis = {

            "filename": file.filename,

            "original_language":
                translated.language,

            "english_transcript":
                translated.text,

            "insights":
                result.model_dump()
        }

        print("STEP 3: Loading existing analyses...")

        analyses = load_analyses()

        print(
            "Existing analyses:",
            len(analyses)
        )

        analyses = [
            item
            for item in analyses
            if item["filename"] != file.filename
        ]

        analyses.append(
            analysis
        )

        print("STEP 4: Saving analyses...")

        save_analyses(
            analyses
        )

        print("STEP 4 COMPLETE")

        print("====================================")
        print("ANALYSIS COMPLETE")
        print("====================================")

        return analysis

    except Exception as e:

        print("====================================")
        print("ANALYSIS ERROR")
        print(type(e).__name__)
        print(str(e))
        print("====================================")

        raise

    finally:

        if os.path.exists(tmp_path):

            os.remove(tmp_path)

            print("Temporary file removed.")

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