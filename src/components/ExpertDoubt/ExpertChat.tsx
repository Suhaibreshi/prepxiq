import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface Message {
  id: number;
  sender: 'student' | 'expert';
  text: string;
  timestamp: Date;
  avatar: string;
  name: string;
}

interface ExpertChatProps {
  expertId: number;
  expertName: string;
  expertAvatar: string;
  doubtTitle?: string;
  onClose: () => void;
}

export default function ExpertChat({
  expertName,
  expertAvatar,
  doubtTitle,
  onClose,
}: ExpertChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'expert',
      text: `Hi! I'm ${expertName}. I'm here to help you with your doubts. How can I assist you today?`,
      timestamp: new Date(),
      avatar: expertAvatar,
      name: expertName,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add student message
    const studentMessage: Message = {
      id: messages.length + 1,
      sender: 'student',
      text: inputMessage,
      timestamp: new Date(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop',
      name: 'You',
    };

    setMessages((prev) => [...prev, studentMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate expert response
    setTimeout(() => {
      const expertMessage: Message = {
        id: messages.length + 2,
        sender: 'expert',
        text: 'That\'s a great question! Let me break it down for you step by step. First, we need to understand the fundamental concept...',
        timestamp: new Date(),
        avatar: expertAvatar,
        name: expertName,
      };
      setMessages((prev) => [...prev, expertMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-screen sm:h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={expertAvatar}
              alt={expertName}
              className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">{expertName}</h2>
              {doubtTitle && (
                <p className="text-xs sm:text-sm text-blue-100 truncate">{doubtTitle}</p>
              )}
              <p className="text-xs text-blue-100">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} className="sm:size-{24}" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 ${message.sender === 'student' ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={message.avatar}
                alt={message.name}
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div
                className={`flex flex-col ${message.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm ${
                    message.sender === 'student'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 sm:gap-3">
              <img
                src={expertAvatar}
                alt={expertName}
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
