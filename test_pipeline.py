from transcribe import translate_audio
from extractor import extract_insights

file_path = "calls/test-audio-2.mp3"

print("=" * 50)
print("STEP 1: TRANSLATING AUDIO")
print("=" * 50)

translated = translate_audio(file_path)

print("Language:", translated.language)
print("Transcript:")
print(translated.text)

print()
print("=" * 50)
print("STEP 2: EXTRACTING INSIGHTS")
print("=" * 50)

result = extract_insights(
    translated.text,
    translated.language
)

print()
print("=" * 50)
print("RESULT")
print("=" * 50)

print(result.model_dump_json(indent=2))