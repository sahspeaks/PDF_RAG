import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  FileText,
  Upload,
  ChevronRight,
  BookOpen,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Loader,
  Send,
} from "lucide-react";
import axios from "axios";
import { ServerURL } from "../ServerURL";

const ChatScreen = ({
  documentId,
  fileName,
  messages = [],
  onMessagesChange,
  onReset,
}) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [retryingIndex, setRetryingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Handle sending a question
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !documentId) return;

    const userMessage = {
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    onMessagesChange?.([...(messages || []), userMessage]);

    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${ServerURL}/api/ask`, {
        query: currentInput,
        documentId: documentId,
      });

      const aiMessage = {
        type: "ai",
        content: response.data.answer,
        timestamp: Date.now(),
        sources: response.data.sources || [],
      };
      onMessagesChange?.([...(messages || []), userMessage, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = {
        type: "error",
        content:
          error.response?.data?.error ||
          "Sorry, there was an error processing your question. Please try again.",
        timestamp: Date.now(),
        canRetry: true,
        originalQuery: currentInput,
      };
      onMessagesChange?.([...(messages || []), userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry for failed messages
  const handleRetry = async (messageIndex, originalQuery) => {
    if (retryingIndex === messageIndex) return;

    setRetryingIndex(messageIndex);

    try {
      const response = await axios.post(`${ServerURL}/api/ask`, {
        query: originalQuery,
        documentId: documentId,
      });

      const aiMessage = {
        type: "ai",
        content: response.data.answer,
        timestamp: Date.now(),
        sources: response.data.sources || [],
      };

      // Replace the error message with the successful response
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = aiMessage;
      onMessagesChange?.(updatedMessages);
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setRetryingIndex(null);
    }
  };

  // Handle copy message
  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    if (e.key === "Escape") {
      setInput("");
    }
  };

  // If no document is selected, show welcome screen
  if (!documentId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#90be6d] p-6 sm:p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#90be6d] to-[#141b10] rounded-3xl mb-6 shadow-2xl animate-pulse">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-white/60 mb-6 leading-relaxed text-sm sm:text-base">
            Upload a PDF document from the sidebar to begin an intelligent
            conversation with your content.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <Sparkles className="w-4 h-4" />
            <span>AI-powered document analysis</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-800 rounded-2xl shadow-xl  overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#90be6d] to-[#141b10] text-white p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Chat with your PDF</span>
            </h2>
            <p className="text-green-100 text-xs sm:text-sm mt-1 flex items-center gap-2">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{fileName || "No file selected"}</span>
            </p>
          </div>
          <button
            onClick={onReset}
            className="bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2 backdrop-blur-sm self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            New PDF
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-neutral-900 to-neutral-800">
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`group relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-5 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-[#90be6d] to-[#141b10] text-white rounded-br-md"
                    : message.type === "ai"
                    ? "bg-gradient-to-r from-[#90be6d] to-[#141b10] text-white  rounded-bl-md shadow-md"
                    : message.type === "error"
                    ? "bg-red-900/50 text-red-200 border border-red-500/30 rounded-bl-md"
                    : "bg-green-900/50 text-green-200 border border-green-500/30 rounded-bl-md"
                }`}
              >
                {/* Message Header */}
                {(message.type === "ai" || message.type === "error") && (
                  <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                    <Bot className="w-3 h-3" />
                    <span>AI Assistant</span>
                    {message.timestamp && (
                      <span>• {formatTime(message.timestamp)}</span>
                    )}
                  </div>
                )}

                {message.type === "user" && (
                  <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                    <User className="w-3 h-3" />
                    <span>You</span>
                    {message.timestamp && (
                      <span>• {formatTime(message.timestamp)}</span>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <div className="text-xs text-white/60 mb-2">Sources:</div>
                    <div className="space-y-1">
                      {message.sources.map((source, sourceIndex) => (
                        <div
                          key={sourceIndex}
                          className="text-xs bg-neutral-600/50 px-2 py-1 rounded border border-green-500/20"
                        >
                          Page {source.page || "Unknown"}:{" "}
                          {source.text
                            ? source.text.substring(0, 100) + "..."
                            : "No preview available"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(message.type === "ai" || message.type === "user") && (
                    <button
                      onClick={() => handleCopy(message.content, index)}
                      className="p-1.5 rounded-md hover:bg-black/10 transition-colors"
                      title="Copy message"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-[#90be6d]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {message.type === "error" && message.canRetry && (
                    <button
                      onClick={() => handleRetry(index, message.originalQuery)}
                      disabled={retryingIndex === index}
                      className="p-1.5 rounded-md hover:bg-black/10 transition-colors disabled:opacity-50"
                      title="Retry"
                    >
                      {retryingIndex === index ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-700 rounded-2xl rounded-bl-md px-5 py-4 border border-green-500/30 shadow-md">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-[#90be6d]" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#90be6d] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#90be6d] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#90be6d] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-white/60 text-sm">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-green-500/30 bg-neutral-800">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your PDF..."
                className="w-full border border-green-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#90be6d] focus:border-[#90be6d] shadow-sm resize-none text-sm sm:text-base bg-neutral-700 text-white placeholder-white/40"
                disabled={isLoading}
                rows={1}
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
              />
              {input.length > 0 && (
                <div className="absolute bottom-2 right-12 text-xs text-white/40">
                  {input.length}/2000
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0 ${
                isLoading || !documentId || !input.trim()
                  ? "bg-neutral-600 text-white/40 cursor-not-allowed transform-none hover:shadow-lg"
                  : "bg-gradient-to-r from-[#90be6d] to-[#141b10] hover:from-[#141b10] hover:to-[#90be6d] text-white"
              }`}
              disabled={isLoading || !documentId || !input.trim()}
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          {/* Input Tips */}
          <div className="mt-2 text-xs text-white/40 flex flex-wrap gap-4">
            <span>• Press Enter to send</span>
            <span>• Shift + Enter for new line</span>
            <span>• Esc to clear</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
