#extractor.py

import os
import json

from dotenv import load_dotenv
from groq import Groq

from schema import CallAnalysis


load_dotenv()

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY")
)


def extract_insights(
    transcript: str,
    detected_language: str
) -> CallAnalysis:

    schema_json = json.dumps(
        CallAnalysis.model_json_schema(),
        indent=2
    )

    prompt = f"""
You are an AI quality analyst for a BFSI
(banking and financial services) call center.

Analyze the following customer service call transcript.

Your job is to extract structured insights about:

1. Overall sentiment
2. Sentiment score
3. Main topics
4. Compliance, regulatory and KYC issues
5. Agent performance
6. Escalation risk
7. Summary
8. Detected language
9. Conversation between the AGENT and CUSTOMER

IMPORTANT:

The transcript may contain both the customer
and the agent.

You must reconstruct the conversation into
individual turns.

For every turn, identify whether the speaker is:

- "agent"
- "customer"

Return the conversation in chronological order.

Do NOT invent conversation that is not present
in the transcript.

If the transcript does not provide enough
information to confidently distinguish a speaker,
make your best reasonable determination based
on the context and conversational role.

Respond with ONLY a valid JSON object matching
this exact schema:

{schema_json}

Detected language of original call:
{detected_language}

Transcript:
{transcript}
"""

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        response_format={
            "type": "json_object"
        }
    )

    raw_output = response.choices[0].message.content

    data = json.loads(raw_output)

    return CallAnalysis(**data)