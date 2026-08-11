# CallSense

### AI-Powered BFSI Call Center Intelligence

CallSense is an AI-powered call analytics platform designed for **BFSI (Banking, Financial Services and Insurance) call centers**.

It takes customer-service call recordings, transcribes them, translates multilingual conversations into English, analyzes the conversation using an LLM, and presents actionable insights through an analytics dashboard.

The goal is to help QA and operations teams quickly understand **what happened during a call, how the customer felt, whether compliance issues were present, and whether the call requires escalation.**

---

## Demo

> **Current MVP:** Local dashboard with two sample call recordings.

The system currently supports:

* Audio upload and analysis
* Multilingual speech transcription
* English translation
* Agent / Customer conversation reconstruction
* Sentiment analysis
* Sentiment scoring
* Topic extraction
* Compliance / KYC flag detection
* Escalation-risk detection
* Agent performance feedback
* Call summaries
* Persistent local analysis storage
* Multi-call analytics dashboard
* Individual call investigation

---

# Architecture

```text
                         ┌──────────────────────┐
                         │      CallSense       │
                         │      Dashboard       │
                         └──────────┬───────────┘
                                    │
                          Upload / Analyze Call
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │      Backend         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Audio File       │
                         │   MP3 / WAV / etc.   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Groq Whisper       │
                         │   Speech-to-Text     │
                         │                      │
                         │  Transcription +     │
                         │  Language Detection  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   English Transcript │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Groq LLM          │
                         │ llama-3.3-70b        │
                         │                      │
                         │ Structured Analysis  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Pydantic Schema    │
                         │    CallAnalysis      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    JSON Storage      │
                         │ data/analyses.json   │
                         └──────────┬───────────┘
                                    │
                                    ▼
               ┌────────────────────┴────────────────────┐
               │                                         │
               ▼                                         ▼
      ┌──────────────────┐                    ┌──────────────────┐
      │    Dashboard     │                    │  Call Details    │
      │                  │                    │                  │
      │ • KPIs           │                    │ • Summary        │
      │ • Sentiment      │                    │ • Topics         │
      │ • Risk           │                    │ • Compliance     │
      │ • Topics         │                    │ • Conversation    │
      │ • Compliance     │                    │ • Transcript      │
      │ • Call Library   │                    │ • Agent Feedback │
      └──────────────────┘                    └──────────────────┘
```

---

# How It Works

## 1. Audio Input

A call recording is provided to the backend.

```text
MP3 / WAV / M4A
       │
       ▼
POST /api/analyze
```

The backend temporarily stores the uploaded file so it can be processed by the speech recognition service.

---

## 2. Speech-to-Text

CallSense uses **Whisper through Groq** to process the audio.

The transcription service:

* Converts speech into text
* Detects the original language
* Supports multilingual recordings
* Translates the recording into English for downstream analysis

Example:

```text
Hindi / English / Hinglish Call
              │
              ▼
        Whisper / Groq
              │
              ▼
     English Transcript
```

---

## 3. LLM Analysis

The English transcript is passed to an LLM with a structured analysis prompt.

The model extracts:

```text
Sentiment
Sentiment Score
Key Topics
Compliance Flags
Agent Performance
Escalation Risk
Summary
Detected Language
Agent / Customer Conversation
```

Instead of returning unstructured text, the model is instructed to return JSON matching the application's Pydantic schema.

---

## 4. Structured Validation

The response is validated using Pydantic.

The core schema looks conceptually like:

```json
{
  "sentiment": "neutral",
  "sentiment_score": 0.2,
  "key_topics": [
    "Loan Payment",
    "Job Loss",
    "KYC Verification"
  ],
  "compliance_flags": [
    "KYC re-verification pending"
  ],
  "agent_performance_notes": "...",
  "escalation_risk": true,
  "summary": "...",
  "detected_language": "English",
  "conversation": [
    {
      "speaker": "customer",
      "text": "..."
    },
    {
      "speaker": "agent",
      "text": "..."
    }
  ]
}
```

This gives the frontend a predictable data structure instead of relying on manually parsed LLM output.

---

# Dashboard

The dashboard aggregates the stored call analyses and provides a high-level view of call-center performance.

### Current metrics

* Total analyzed calls
* Average sentiment score
* Escalation rate
* Compliance issue rate
* Sentiment distribution
* Escalation distribution
* Most discussed topics
* Compliance issues
* Analyzed call library

Example:

```text
┌────────────────┐ ┌────────────────┐
│ Total Calls    │ │ Avg Sentiment  │
│      25        │ │      0.32      │
└────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐
│ Escalation     │ │ Compliance     │
│     28%        │ │     16%        │
└────────────────┘ └────────────────┘
```

Each call can be opened individually for deeper investigation.

---

# Individual Call Analysis

The call details page provides a complete view of a single interaction.

### Overview

```text
Sentiment
Sentiment Score
Language
Escalation Risk
```

### Analysis

```text
Call Summary
Key Topics
Compliance Flags
Agent Performance
```

### Conversation

The transcript is reconstructed into:

```text
👤 CUSTOMER

I lost my job last month...


🤖 AGENT

I understand, sir. Let me see
what options we have...


👤 CUSTOMER

Can I pay half the EMI?


🤖 AGENT

I'll check the restructuring
options for you.
```

This makes the raw transcript much easier to review.

---

# Project Structure

```text
call-sense/
│
├── api/
│   └── index.py
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── call.html
│   ├── call.js
│   └── style.css
│
├── calls/
│   ├── test-audio-1.mp3
│   └── test-audio-2.mp3
│
├── data/
│   └── analyses.json
│
├── extractor.py
├── transcribe.py
├── schema.py
├── requirements.txt
├── .env
└── README.md
```

### Backend

**`api/index.py`**

FastAPI application responsible for:

* API endpoints
* Audio processing
* Call analysis
* Local result storage
* Serving the frontend

### `transcribe.py`

Handles speech recognition and translation using Groq's Whisper model.

### `extractor.py`

Sends transcripts to the LLM and converts the response into the application's structured `CallAnalysis` model.

### `schema.py`

Defines the Pydantic data contract for call analysis.

### `frontend/`

Contains the lightweight web application:

* Analyze page
* Dashboard
* Individual call analysis page
* Styling
* Client-side JavaScript

### `calls/`

Stores recordings waiting to be analyzed.

### `data/`

Stores the generated analysis results.

---

# API

## Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

---

## Analyze a Call

```http
POST /api/analyze
```

Accepts an audio file and returns the complete analysis.

Example response:

```json
{
  "filename": "test-audio-1.mp3",
  "original_language": "English",
  "english_transcript": "...",
  "insights": {
    "sentiment": "neutral",
    "sentiment_score": 0.2,
    "key_topics": [],
    "compliance_flags": [],
    "agent_performance_notes": "...",
    "escalation_risk": true,
    "summary": "...",
    "detected_language": "English",
    "conversation": []
  }
}
```

---

## Get Stored Calls

```http
GET /api/calls
```

Returns all previously analyzed calls.

---

## Analyze All Calls

```http
POST /api/analyze-all
```

Scans the `calls/` directory and analyzes recordings that have not already been processed.

---

# Tech Stack

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

### AI

* Groq API
* Whisper Large V3
* Llama 3.3 70B

### Frontend

* HTML
* CSS
* JavaScript

### Storage

* JSON

### Development

* Python virtual environment
* REST APIs

---

# Running Locally

## 1. Clone the repository

```bash
git clone <your-repository-url>

cd call-sense
```

---

## 2. Create a virtual environment

```bash
python3 -m venv venv
```

Activate it:

### macOS / Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Add environment variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

---

## 5. Start the application

```bash
uvicorn api.index:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

Dashboard:

```text
http://127.0.0.1:8000/frontend/dashboard.html
```

---

# Example Workflow

```text
1. Place recordings inside /calls

             ↓

2. Open CallSense Dashboard

             ↓

3. Click "Analyze All Calls"

             ↓

4. Whisper processes the recordings

             ↓

5. LLM analyzes the transcripts

             ↓

6. Pydantic validates the result

             ↓

7. Results are stored in analyses.json

             ↓

8. Dashboard aggregates the results

             ↓

9. Click any call for detailed analysis
```

---

# Why This Could Be Useful

Traditional call-center QA often requires humans to manually listen to a sample of calls and identify issues.

CallSense explores how AI can reduce that manual effort by automatically surfacing:

* Negative customer experiences
* Potential escalation cases
* Compliance and KYC issues
* Frequently discussed topics
* Agent performance observations
* Customer concerns

Instead of asking a QA analyst:

> "Which calls should I listen to?"

CallSense attempts to answer:

> "These are the calls that deserve your attention."

---

# Current Limitations

This project is intentionally an MVP.

### Speaker identification

The current system uses the LLM to infer whether a transcript segment belongs to the agent or customer.

Because the transcription pipeline does not currently perform dedicated speaker diarization, speaker identification may occasionally be inaccurate.

### Storage

Analysis results are currently stored in a local JSON file.

This keeps the MVP simple and free, but is not suitable for large-scale production workloads.

### Processing

Audio processing and LLM analysis happen synchronously.

Long recordings may therefore take longer to process.

### Compliance

Compliance detection is currently LLM-based and should not be treated as a replacement for formal regulatory or legal review.

---

# Future Improvements

## 1. Speaker Diarization

Introduce dedicated speaker diarization:

```text
Speaker 1 → Customer
Speaker 2 → Agent
```

instead of relying entirely on contextual inference.

---

## 2. Production Database

Replace:

```text
analyses.json
```

with a proper database such as PostgreSQL.

---

## 3. Agent-Level Analytics

Track performance across individual agents:

```text
Agent
 ├── Average Sentiment
 ├── Escalation Rate
 ├── Compliance Rate
 ├── Calls Handled
 └── Customer Satisfaction
```

---

## 4. Advanced QA Scoring

Introduce automated quality scoring:

```text
Greeting                ✓
Identity Verification   ✓
KYC Verification        ⚠
Empathy                 ✓
Resolution              ✓
Closing                 ✓
```

---

## 5. Real-Time Call Analysis

Move from:

```text
Recorded Call
      ↓
Post-call Analysis
```

towards:

```text
Live Call
    ↓
Streaming STT
    ↓
Real-time Analysis
    ↓
Live Agent Assistance
```

---

## 6. Multilingual Analytics

Expand support for Indian languages and code-mixed conversations such as:

```text
Hindi + English
Marathi + English
Tamil + English
Gujarati + English
```

while preserving the original language alongside the English analysis.

---

# Product Vision

The long-term vision for CallSense is to become an intelligent **AI quality-assurance and call-monitoring platform for financial-services contact centers**.

```text
                    CALLSENSE
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
      ANALYZE        MONITOR       IMPROVE
          │             │             │
          ▼             ▼             ▼
      Calls         Compliance     Agents
      Sentiment     Escalations    QA Scores
      Topics        Risk           Coaching
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                  Better Customer
                     Experience
```

---

# Disclaimer

CallSense is a technical prototype built for demonstration and experimentation.

AI-generated sentiment, speaker identification, summaries, and compliance observations may contain errors and should be reviewed by qualified personnel before being used for operational, regulatory, financial, or customer-impacting decisions.

---

## Built With

Python · FastAPI · Groq · Whisper · Llama · Pydantic · JavaScript

**CallSense — Turn conversations into actionable intelligence.**
