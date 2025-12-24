'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2 } from 'lucide-react';
import { useChat, useChatSuggestions } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const {
    messages,
    isLoading,
    streamingContent,
    isOpen,
    sendMessageStreaming,
    clearChat,
    open,
    close,
    toggle,
  } = useChat();

  const suggestions = useChatSuggestions();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessageStreaming(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessageStreaming(suggestion);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggle}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300',
          'bg-ocean-600 hover:bg-ocean-700 text-white',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right',
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-0 opacity-0 pointer-events-none'
        )}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center">
              <span className="text-lg">🐠</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                ReefBot
              </h3>
              <p className="text-xs text-gray-500">
                Your ocean conditions assistant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={close}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🐠</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Aloha! I'm ReefBot
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Ask me about ocean conditions, coral health, or snorkeling spots around Oahu.
              </p>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left text-sm p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-ocean-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Streaming content */}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                {streamingContent}
                <span className="inline-block w-1 h-4 ml-1 bg-ocean-500 animate-pulse" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 text-ocean-500 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ocean conditions..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'p-2 rounded-full transition-colors',
                input.trim() && !isLoading
                  ? 'bg-ocean-600 hover:bg-ocean-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
