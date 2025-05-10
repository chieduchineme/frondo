import React, { useState } from 'react';
import axios from 'axios';

// Base URL of the backend API
const API_BASE = 'https://odogs.onrender.com';

// Type definition for chat messages
interface ChatMessage {
  role: 'user' | 'bot';
  message: string;
}

// ChatbotSection is the main chat UI component
const ChatbotSection: React.FC = () => {
  // Input value from the user
  const [chatInput, setChatInput] = useState('');

  // Chat history, including messages from both user and bot
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Tracks whether the bot is currently responding
  const [loading, setLoading] = useState(false);

  // Handles sending a user message to the backend chatbot API
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = chatInput.trim();
    if (!trimmed) return;

    // Add the user's message to chat history
    const userMessage: ChatMessage = { role: 'user', message: trimmed };
    setChatHistory(prev => [...prev, userMessage]);

    // Clear input and show loading state
    setChatInput('');
    setLoading(true);

    try {
      console.log('Sending to chatbot:', trimmed);

      // Send the message to the backend
      const response = await axios.post(`${API_BASE}/chatbot/ask`, {
        user_input: trimmed,
      });

      // Extract the bot's reply or use a fallback
      let reply = response.data?.response || '🤖 No reply from bot.';

      // ✅ Clean the reply

      // Remove all Markdown bold markers (**)
      reply = reply.replace(/\*\*/g, '');

      // If reply starts with "Based on...", trim that part
      if (reply.toLowerCase().startsWith('based on')) {
        // Extract the main content after the first comma, colon, or similar punctuation
        const match = reply.match(/based on[^,.:;]*[,.:;]\s*(.*)/i);
        if (match && match[1]) {
          // Lowercase the first character of the trimmed sentence
          reply = match[1].charAt(0).toLowerCase() + match[1].slice(1);
        }
      }

      // Add the bot's response to chat history
      setChatHistory(prev => [...prev, { role: 'bot', message: reply }]);
    } catch (error: any) {
      // Handle errors gracefully and show to the user
      const errMessage =
        error.response?.data?.error ||
        error.message ||
        '❌ Unknown error occurred.';

      setChatHistory(prev => [
        ...prev,
        {
          role: 'bot',
          message: `❌ Error with input: "${trimmed}"\nDetails: ${errMessage}`,
        },
      ]);
    } finally {
      // Turn off loading indicator
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2>🤖 Chatbot</h2>

      {/* Chat conversation history */}
      <div className="chat-box">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <span>
              {msg.role === 'user' ? '🧑' : '🤖'} {msg.message}
            </span>
          </div>
        ))}

        {/* Loading state indicator */}
        {loading && (
          <div className="chat-message bot">
            <span>🤖 Thinking...</span>
          </div>
        )}
      </div>

      {/* Input form for sending messages */}
      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
};

export default ChatbotSection;
