import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.5-flash-lite"


def summarize_notes(lead):
    notes = lead.notes or "No interaction notes were provided."

    prompt = f"""
You are an AI assistant for an event lead management system.

Summarize the interaction notes for a sales or business development team.

Lead:
Name: {lead.name}
Company: {lead.company}
Event: {lead.event}
Follow-up Status: {lead.follow_up_status}

Interaction Notes:
{notes}

Create a concise professional summary.

Do not invent information.
Only use information provided in the lead details and interaction notes.
Keep the summary between 2 and 4 sentences.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text.strip()


def draft_follow_up(lead):
    notes = lead.notes or "No interaction notes were provided."

    prompt = f"""
You are an AI sales assistant for an event lead management system.

Draft a professional follow-up message for this lead.

Lead:
Name: {lead.name}
Company: {lead.company}
Event: {lead.event}
Follow-up Status: {lead.follow_up_status}

Interaction Notes:
{notes}

Requirements:
- Address the lead by name.
- Mention the event naturally.
- Use the interaction notes to personalize the message.
- Keep the message concise.
- Use a professional but friendly tone.
- Do not invent products, prices, meetings, promises, or facts.
- Include a clear next step.
- Do not include a subject line.
- Return only the message body.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text.strip()