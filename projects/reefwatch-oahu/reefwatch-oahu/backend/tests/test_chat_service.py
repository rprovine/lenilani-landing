"""
Tests for chat service.
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.chat_service import (
    detect_pidgin,
    get_session,
    update_session,
    get_session_history,
    clear_session,
    cleanup_old_sessions,
    SYSTEM_PROMPT,
    _sessions,
)


class TestDetectPidgin:
    """Tests for detect_pidgin function."""

    def test_detect_pidgin_with_markers(self):
        """Test detection with clear Pidgin markers."""
        assert detect_pidgin("Eh brah, howzit?") is True
        assert detect_pidgin("Shoots, da water stay good!") is True
        assert detect_pidgin("Ho brah, choke fish out dea!") is True

    def test_detect_pidgin_single_marker(self):
        """Test that single marker is not enough."""
        assert detect_pidgin("Hey brah") is False  # Only one marker

    def test_detect_pidgin_standard_english(self):
        """Test that standard English is not detected as Pidgin."""
        assert detect_pidgin("How are the ocean conditions today?") is False
        assert detect_pidgin("What is the water temperature?") is False
        assert detect_pidgin("Can you recommend a snorkeling spot?") is False

    def test_detect_pidgin_case_insensitive(self):
        """Test that detection is case-insensitive."""
        assert detect_pidgin("EH BRAH HOWZIT") is True
        assert detect_pidgin("eh brah howzit") is True

    def test_detect_pidgin_mixed_text(self):
        """Test detection with mixed Pidgin and English."""
        assert detect_pidgin("Brah, can you tell me da conditions stay good?") is True


class TestSessionManagement:
    """Tests for session management functions."""

    def setup_method(self):
        """Clear sessions before each test."""
        _sessions.clear()

    def test_get_session_creates_new(self):
        """Test that get_session creates a new session if none exists."""
        session = get_session("test-session-1")

        assert session is not None
        assert session["id"] == "test-session-1"
        assert session["messages"] == []
        assert session["pidgin_mode"] is False
        assert "created_at" in session
        assert "last_activity" in session

    def test_get_session_returns_existing(self):
        """Test that get_session returns existing session."""
        session1 = get_session("test-session-2")
        session1["messages"].append({"role": "user", "content": "Hello"})

        session2 = get_session("test-session-2")

        assert session1 is session2
        assert len(session2["messages"]) == 1

    def test_update_session_adds_message(self):
        """Test that update_session adds a message."""
        get_session("test-session-3")
        update_session("test-session-3", "user", "Hello")

        session = get_session("test-session-3")
        assert len(session["messages"]) == 1
        assert session["messages"][0]["role"] == "user"
        assert session["messages"][0]["content"] == "Hello"

    def test_update_session_updates_activity(self):
        """Test that update_session updates last_activity."""
        session = get_session("test-session-4")
        old_activity = session["last_activity"]

        # Small delay to ensure time difference
        import time
        time.sleep(0.01)

        update_session("test-session-4", "user", "Test")

        assert session["last_activity"] > old_activity

    def test_update_session_limits_messages(self):
        """Test that update_session limits to 20 messages."""
        get_session("test-session-5")

        # Add 25 messages
        for i in range(25):
            update_session("test-session-5", "user", f"Message {i}")

        session = get_session("test-session-5")
        assert len(session["messages"]) == 20
        # Should have the last 20 messages
        assert session["messages"][0]["content"] == "Message 5"

    def test_get_session_history(self):
        """Test getting session history."""
        get_session("test-session-6")
        update_session("test-session-6", "user", "Hello")
        update_session("test-session-6", "assistant", "Hi there!")

        history = get_session_history("test-session-6")

        assert len(history) == 2
        assert history[0]["role"] == "user"
        assert history[1]["role"] == "assistant"

    def test_get_session_history_nonexistent(self):
        """Test getting history for nonexistent session."""
        history = get_session_history("nonexistent-session")
        assert history == []

    def test_clear_session(self):
        """Test clearing a session."""
        get_session("test-session-7")
        result = clear_session("test-session-7")

        assert result is True
        assert "test-session-7" not in _sessions

    def test_clear_session_nonexistent(self):
        """Test clearing nonexistent session returns False."""
        result = clear_session("nonexistent-session")
        assert result is False

    def test_cleanup_old_sessions(self):
        """Test cleaning up old sessions."""
        # Create sessions with different ages
        session1 = get_session("old-session")
        session1["last_activity"] = datetime.utcnow() - timedelta(hours=48)

        session2 = get_session("new-session")
        session2["last_activity"] = datetime.utcnow()

        cleaned = cleanup_old_sessions(max_age_hours=24)

        assert cleaned == 1
        assert "old-session" not in _sessions
        assert "new-session" in _sessions


class TestSystemPrompt:
    """Tests for system prompt configuration."""

    def test_system_prompt_not_empty(self):
        """Test that system prompt is defined."""
        assert SYSTEM_PROMPT is not None
        assert len(SYSTEM_PROMPT) > 0

    def test_system_prompt_includes_key_concepts(self):
        """Test that system prompt includes key concepts."""
        prompt_lower = SYSTEM_PROMPT.lower()

        assert "sst" in prompt_lower
        assert "dhw" in prompt_lower
        assert "bleaching" in prompt_lower
        assert "coral" in prompt_lower

    def test_system_prompt_includes_pidgin_instructions(self):
        """Test that system prompt includes Pidgin instructions."""
        assert "pidgin" in SYSTEM_PROMPT.lower()
        assert "brah" in SYSTEM_PROMPT.lower()


class TestBuildContextPrompt:
    """Tests for build_context_prompt function."""

    @pytest.mark.asyncio
    async def test_build_context_prompt_returns_string(self):
        """Test that build_context_prompt returns a string."""
        with patch("app.services.chat_service.get_data_summary") as mock_summary:
            mock_summary.return_value = {
                "date": "2024-01-15",
                "total_sites": 15,
                "sites_with_data": 15,
                "average_sst": 26.5,
                "max_sst": 28.0,
                "average_dhw": 2.5,
                "max_dhw": 5.0,
                "risk_distribution": {
                    "low": 10,
                    "moderate": 3,
                    "high": 2,
                    "severe": 0
                },
                "sites": [
                    {"name": "Hanauma Bay", "sst": 26.5, "dhw": 2.1, "risk": "Low"}
                ]
            }

            from app.services.chat_service import build_context_prompt
            result = await build_context_prompt()

            assert isinstance(result, str)
            assert "Ocean Conditions" in result
            assert "26.5" in result

    @pytest.mark.asyncio
    async def test_build_context_prompt_handles_error(self):
        """Test that build_context_prompt handles errors gracefully."""
        with patch("app.services.chat_service.get_data_summary") as mock_summary:
            mock_summary.side_effect = Exception("Database error")

            from app.services.chat_service import build_context_prompt
            result = await build_context_prompt()

            assert "unavailable" in result.lower()


class TestChat:
    """Tests for chat function."""

    def setup_method(self):
        """Clear sessions before each test."""
        _sessions.clear()

    @pytest.mark.asyncio
    async def test_chat_creates_session(self):
        """Test that chat creates a new session if none provided."""
        with patch("app.services.chat_service.anthropic") as mock_anthropic:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.content = [MagicMock(text="Hello!")]
            mock_client.messages.create.return_value = mock_response
            mock_anthropic.Anthropic.return_value = mock_client

            with patch("app.services.chat_service.build_context_prompt") as mock_context:
                mock_context.return_value = "Context"

                from app.services.chat_service import chat
                response, session_id = await chat("Hello")

                assert session_id is not None
                assert len(session_id) > 0

    @pytest.mark.asyncio
    async def test_chat_uses_existing_session(self):
        """Test that chat uses existing session ID."""
        with patch("app.services.chat_service.anthropic") as mock_anthropic:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.content = [MagicMock(text="Hello!")]
            mock_client.messages.create.return_value = mock_response
            mock_anthropic.Anthropic.return_value = mock_client

            with patch("app.services.chat_service.build_context_prompt") as mock_context:
                mock_context.return_value = "Context"

                from app.services.chat_service import chat
                response, session_id = await chat("Hello", session_id="my-session")

                assert session_id == "my-session"

    @pytest.mark.asyncio
    async def test_chat_detects_pidgin(self):
        """Test that chat detects and enables Pidgin mode."""
        with patch("app.services.chat_service.anthropic") as mock_anthropic:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.content = [MagicMock(text="Shoots!")]
            mock_client.messages.create.return_value = mock_response
            mock_anthropic.Anthropic.return_value = mock_client

            with patch("app.services.chat_service.build_context_prompt") as mock_context:
                mock_context.return_value = "Context"

                from app.services.chat_service import chat
                await chat("Eh brah, howzit?", session_id="pidgin-test")

                session = get_session("pidgin-test")
                assert session["pidgin_mode"] is True

    @pytest.mark.asyncio
    async def test_chat_handles_api_error(self):
        """Test that chat handles API errors gracefully."""
        with patch("app.services.chat_service.anthropic") as mock_anthropic:
            mock_anthropic.Anthropic.side_effect = Exception("API Error")

            with patch("app.services.chat_service.build_context_prompt") as mock_context:
                mock_context.return_value = "Context"

                from app.services.chat_service import chat
                response, session_id = await chat("Hello")

                assert "error" in response.lower() or "trouble" in response.lower()
