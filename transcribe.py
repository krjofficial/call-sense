import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def transcribe_audio(file_path: str):
    """Transcribes audio in its original language."""
    with open(file_path, "rb") as audio_file:
        result = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="verbose_json"
        )
    return result

def translate_audio(file_path: str):
    """Translates audio directly to English text."""
    with open(file_path, "rb") as audio_file:
        result = client.audio.translations.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="verbose_json"
        )
    return result

if __name__ == "__main__":
    file_path = "test-audio-2.mp3"  # Audio file here...

    original = transcribe_audio(file_path)
    print("Detected language:", original.language)
    print("\nOriginal transcript:\n")
    print(original.text)

    translated = translate_audio(file_path)
    print("\nEnglish translation:\n")
    print(translated.text)