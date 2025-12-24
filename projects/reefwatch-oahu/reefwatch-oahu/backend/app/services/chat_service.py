"""
AI Chat Service for ReefWatch Oahu.

Provides conversational AI assistance using Anthropic's Claude API.
The assistant can answer questions about ocean conditions, coral health,
and provide recommendations for visitors.
"""

import logging
import re
import uuid
from datetime import datetime
from typing import AsyncGenerator, Dict, List, Optional

import anthropic

from app.core.config import get_settings
from app.services.bigquery_service import get_data_summary, get_current_conditions

logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory session storage (use Redis in production for scalability)
_sessions: Dict[str, dict] = {}

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are ReefBot, a friendly and knowledgeable ocean scientist assistant for ReefWatch Oahu. Your role is to help visitors understand ocean conditions and make informed decisions about snorkeling and diving around Oahu.

## Your Expertise:
- Coral reef ecosystems and their health indicators
- Ocean temperature patterns and their effects on marine life
- Coral bleaching causes, detection, and impacts
- Hawaiian marine life and conservation
- Safe snorkeling and diving practices
- Oahu's popular reef sites and their characteristics

## Key Concepts You Explain:
- **SST (Sea Surface Temperature)**: Water temperature at the ocean surface. Normal for Hawaii is 24-27°C.
- **SST Anomaly**: How much current temperature differs from the historical average for this time of year.
- **DHW (Degree Heating Weeks)**: Accumulated heat stress over 12 weeks. Key bleaching thresholds:
  - DHW < 4: Low risk, normal conditions
  - DHW 4-8: Moderate risk, coral stress possible
  - DHW 8-12: High risk, bleaching likely
  - DHW > 12: Severe risk, mortality possible
- **HotSpot**: Measures how much SST exceeds the maximum monthly mean temperature.
- **Coral Bleaching**: When stressed coral expels its symbiotic algae (zooxanthellae), turning white.

## Guidelines:
1. Always cite current data when discussing ocean conditions (use the context provided).
2. Be encouraging about reef visits but emphasize conservation and reef-safe practices.
3. If conditions are poor at one site, suggest alternatives with better conditions.
4. Explain technical terms simply when users seem unfamiliar.
5. Provide practical advice: best times to visit, what to bring, safety tips.
6. Acknowledge when you don't have data for a specific question.

## Hawaiian Pidgin:
If a user writes in Hawaiian Pidgin English, respond in a friendly Pidgin style. Examples:
- User: "Eh brah, how da reef stay looking?"
- You: "Shoots! Da reef stay looking pretty good today, brah. Water temp stay nice at around 26°C..."

## Tone:
- Friendly and approachable, like a local marine biologist
- Enthusiastic about sharing knowledge
- Concerned about reef conservation but not preachy
- Uses "aloha" spirit - welcoming and helpful

## Safety First:
Always remind users about:
- Reef-safe sunscreen
- Not touching or standing on coral
- Checking conditions before entering water
- Following lifeguard instructions"""


def detect_pidgin(text: str) -> bool:
    """
    Detect if the user is writing in Hawaiian Pidgin English.

    Looks for common Pidgin words and phrases.
    """
    pidgin_markers = [
        r'\bbrah\b', r'\bbruddah\b', r'\bsista\b', r'\bdah\b', r'\bda\b',
        r'\bstay\b', r'\bshoots\b', r'\brain\b', r'\brajah\b', r'\bhowzit\b',
        r'\bchoke\b', r'\bono\b', r'\bkine\b', r'\bwea\b', r'\bwen\b',
        r'\bmoke\b', r'\bhaole\b', r'\bkeiki\b', r'\btutu\b', r'\bpuka\b',
        r'\bpau\b', r'\bmahalos?\b', r'\beh\b'
    ]

    text_lower = text.lower()
    matches = sum(1 for pattern in pidgin_markers if re.search(pattern, text_lower))
    return matches >= 2


def get_session(session_id: str) -> dict:
    """Get or create a chat session."""
    if session_id not in _sessions:
        _sessions[session_id] = {
            "id": session_id,
            "messages": [],
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "pidgin_mode": False
        }
    return _sessions[session_id]


def update_session(session_id: str, role: str, content: str) -> None:
    """Add a message to the session history."""
    session = get_session(session_id)
    session["messages"].append({"role": role, "content": content})
    session["last_activity"] = datetime.utcnow()

    # Keep only last 20 messages to manage context size
    if len(session["messages"]) > 20:
        session["messages"] = session["messages"][-20:]


async def build_context_prompt() -> str:
    """
    Build context string with current ocean conditions.

    This is injected into each chat request to give the AI
    up-to-date information to reference.
    """
    try:
        summary = await get_data_summary()

        context = f"""
## Current Ocean Conditions (as of {summary['date']}):

**Overall Status:**
- Sites monitored: {summary['total_sites']}
- Sites with current data: {summary['sites_with_data']}
- Average SST: {summary['average_sst']}°C
- Maximum SST: {summary['max_sst']}°C
- Average DHW: {summary['average_dhw']}
- Maximum DHW: {summary['max_dhw']}

**Risk Distribution:**
- Low risk sites: {summary['risk_distribution']['low']}
- Moderate risk sites: {summary['risk_distribution']['moderate']}
- High risk sites: {summary['risk_distribution']['high']}
- Severe risk sites: {summary['risk_distribution']['severe']}

**Site Details:**
"""
        for site in summary['sites']:
            sst_str = f"{site['sst']}°C" if site['sst'] else "N/A"
            dhw_str = f"{site['dhw']}" if site['dhw'] else "N/A"
            context += f"- {site['name']}: SST {sst_str}, DHW {dhw_str}, Risk: {site['risk']}\n"

        return context

    except Exception as e:
        logger.error(f"Error building context: {e}")
        return "\n(Current ocean data temporarily unavailable)\n"


async def chat(
    message: str,
    session_id: Optional[str] = None,
    include_context: bool = True
) -> tuple[str, str]:
    """
    Send a message and get a response from the AI assistant.

    Args:
        message: User's message
        session_id: Optional session ID for conversation continuity
        include_context: Whether to include current ocean data in context

    Returns:
        Tuple of (response_text, session_id)
    """
    # Create or retrieve session
    if not session_id:
        session_id = str(uuid.uuid4())

    session = get_session(session_id)

    # Detect Pidgin and adjust system prompt
    is_pidgin = detect_pidgin(message)
    if is_pidgin:
        session["pidgin_mode"] = True

    # Build system prompt with optional context
    system_content = SYSTEM_PROMPT

    if session["pidgin_mode"]:
        system_content += "\n\n(User is using Hawaiian Pidgin - respond in a friendly Pidgin style!)"

    if include_context:
        context = await build_context_prompt()
        system_content += f"\n\n{context}"

    # Add user message to history
    update_session(session_id, "user", message)

    # Build messages for API call
    messages = session["messages"].copy()

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        response = client.messages.create(
            model=settings.chat_model,
            max_tokens=settings.chat_max_tokens,
            system=system_content,
            messages=messages
        )

        assistant_message = response.content[0].text

        # Add assistant response to history
        update_session(session_id, "assistant", assistant_message)

        return assistant_message, session_id

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        error_message = "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
        return error_message, session_id

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return "An unexpected error occurred. Please try again.", session_id


async def chat_stream(
    message: str,
    session_id: Optional[str] = None,
    include_context: bool = True
) -> AsyncGenerator[tuple[str, bool, str], None]:
    """
    Stream a chat response for better UX.

    Yields tuples of (chunk_text, is_final, session_id)
    """
    if not session_id:
        session_id = str(uuid.uuid4())

    session = get_session(session_id)

    # Detect Pidgin
    is_pidgin = detect_pidgin(message)
    if is_pidgin:
        session["pidgin_mode"] = True

    # Build system prompt
    system_content = SYSTEM_PROMPT

    if session["pidgin_mode"]:
        system_content += "\n\n(User is using Hawaiian Pidgin - respond in a friendly Pidgin style!)"

    if include_context:
        context = await build_context_prompt()
        system_content += f"\n\n{context}"

    # Add user message
    update_session(session_id, "user", message)
    messages = session["messages"].copy()

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        full_response = ""

        with client.messages.stream(
            model=settings.chat_model,
            max_tokens=settings.chat_max_tokens,
            system=system_content,
            messages=messages
        ) as stream:
            for text in stream.text_stream:
                full_response += text
                yield (text, False, session_id)

        # Save full response to session
        update_session(session_id, "assistant", full_response)

        # Final chunk
        yield ("", True, session_id)

    except Exception as e:
        logger.error(f"Stream error: {e}")
        yield ("Sorry, I encountered an error. Please try again.", True, session_id)


def get_session_history(session_id: str) -> List[dict]:
    """Get the message history for a session."""
    if session_id in _sessions:
        return _sessions[session_id]["messages"]
    return []


def clear_session(session_id: str) -> bool:
    """Clear a chat session."""
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def cleanup_old_sessions(max_age_hours: int = 24) -> int:
    """Remove sessions older than max_age_hours."""
    from datetime import timedelta

    cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
    old_sessions = [
        sid for sid, session in _sessions.items()
        if session["last_activity"] < cutoff
    ]

    for sid in old_sessions:
        del _sessions[sid]

    if old_sessions:
        logger.info(f"Cleaned up {len(old_sessions)} old chat sessions")

    return len(old_sessions)
