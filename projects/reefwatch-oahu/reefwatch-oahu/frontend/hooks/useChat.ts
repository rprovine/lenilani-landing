/**
 * Custom hook for managing AI chat interactions.
 */

import { useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store';
import * as api from '@/lib/api';
import type { ChatMessage } from '@/types';

export function useChat() {
  const {
    chatMessages,
    chatSessionId,
    isChatLoading,
    chatOpen,
    addChatMessage,
    setChatSessionId,
    setChatLoading,
    clearChat,
    setChatOpen,
    toggleChat,
  } = useAppStore();

  const [streamingContent, setStreamingContent] = useState('');

  /**
   * Send a message and get a response (non-streaming).
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isChatLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      setChatLoading(true);

      try {
        const response = await api.sendChatMessage({
          message: content.trim(),
          session_id: chatSessionId || undefined,
          include_context: true,
        });

        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        addChatMessage(assistantMessage);

        // Store session ID
        setChatSessionId(response.session_id);
      } catch (error) {
        // Add error message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        addChatMessage(errorMessage);
      } finally {
        setChatLoading(false);
      }
    },
    [
      isChatLoading,
      chatSessionId,
      addChatMessage,
      setChatLoading,
      setChatSessionId,
    ]
  );

  /**
   * Send a message with streaming response.
   */
  const sendMessageStreaming = useCallback(
    async (content: string) => {
      if (!content.trim() || isChatLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      setChatLoading(true);
      setStreamingContent('');

      let fullResponse = '';

      await api.streamChatMessage(
        {
          message: content.trim(),
          session_id: chatSessionId || undefined,
          include_context: true,
        },
        // On chunk
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        // On complete
        (sessionId) => {
          // Add final message
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
          };
          addChatMessage(assistantMessage);
          setChatSessionId(sessionId);
          setChatLoading(false);
          setStreamingContent('');
        },
        // On error
        () => {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          };
          addChatMessage(errorMessage);
          setChatLoading(false);
          setStreamingContent('');
        }
      );
    },
    [
      isChatLoading,
      chatSessionId,
      addChatMessage,
      setChatLoading,
      setChatSessionId,
    ]
  );

  /**
   * Clear the chat history.
   */
  const handleClearChat = useCallback(async () => {
    if (chatSessionId) {
      try {
        await api.clearChatSession(chatSessionId);
      } catch {
        // Ignore errors clearing session
      }
    }
    clearChat();
  }, [chatSessionId, clearChat]);

  return {
    messages: chatMessages,
    isLoading: isChatLoading,
    streamingContent,
    isOpen: chatOpen,
    sendMessage,
    sendMessageStreaming,
    clearChat: handleClearChat,
    open: () => setChatOpen(true),
    close: () => setChatOpen(false),
    toggle: toggleChat,
  };
}

/**
 * Get suggested questions based on current conditions.
 */
export function useChatSuggestions() {
  const { sites, alerts } = useAppStore();

  const suggestions: string[] = [];

  // Add general suggestions
  suggestions.push("What's the current water temperature around Oahu?");
  suggestions.push('What does DHW mean and why is it important?');
  suggestions.push('Which snorkel spots are best for beginners?');

  // Add contextual suggestions based on conditions
  const highRiskSites = sites.filter((s) => s.risk.score >= 2);
  if (highRiskSites.length > 0) {
    suggestions.push('Why are some sites showing high risk right now?');
    suggestions.push('Is it safe to snorkel at sites with high risk?');
  }

  if (alerts.length > 0) {
    suggestions.push('Tell me more about the current alerts.');
  }

  // Limit to 5 suggestions
  return suggestions.slice(0, 5);
}
