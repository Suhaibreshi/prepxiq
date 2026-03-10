import { useState } from 'react';
import { Users, MessageSquare, Clock, Award, HelpCircle, ArrowRight, ChevronLeft } from 'lucide-react';
import ExpertProfile from './ExpertDoubt/ExpertProfile';
import DoubtForm from './ExpertDoubt/DoubtForm';
import ExpertChat from './ExpertDoubt/ExpertChat';

interface Expert {
  id: number;
  name: string;
  subject: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: string;
  responseTime: string;
}

interface Conversation {
  id: number;
  expertId: number;
  expertName: string;
  subject: string;
  question: string;
  status: 'active' | 'resolved' | 'pending';
  lastMessage: string;
  timestamp: Date;
}

interface ExpertDoubtSolvingProps {
  onBack?: () => void;
}

export default function ExpertDoubtSolving({ onBack }: ExpertDoubtSolvingProps) {
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    expertId: number;
    expertName: string;
    expertAvatar: string;
    doubtTitle: string;
  } | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      expertId: 1,
      expertName: 'Dr. Rajesh Kumar',
      subject: 'Physics',
      question: 'Circular Motion - Centripetal Acceleration',
      status: 'resolved',
      lastMessage: 'Great! Now you understand the concept perfectly.',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      expertId: 2,
      expertName: 'Priya Sharma',
      subject: 'Chemistry',
      question: 'Organic Chemistry - Reaction Mechanisms',
      status: 'active',
      lastMessage: 'Let me explain the SN2 mechanism step by step...',
      timestamp: new Date(Date.now() - 3600000),
    },
  ]);

  const experts: Expert[] = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      subject: 'Physics',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop',
      rating: 4.9,
      reviews: 342,
      experience: '15+ years',
      responseTime: '< 2 minutes',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      subject: 'Chemistry',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop',
      rating: 4.8,
      reviews: 298,
      experience: '12+ years',
      responseTime: '< 3 minutes',
    },
    {
      id: 3,
      name: 'Amit Verma',
      subject: 'Mathematics',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop',
      rating: 4.9,
      reviews: 421,
      experience: '18+ years',
      responseTime: '< 1 minute',
    },
    {
      id: 4,
      name: 'Dr. Neha Singh',
      subject: 'Biology',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop',
      rating: 4.7,
      reviews: 267,
      experience: '13+ years',
      responseTime: '< 2 minutes',
    },
  ];

  const handleChatClick = (expertId: number) => {
    const expert = experts.find((e) => e.id === expertId);
    if (expert) {
      setActiveChat({
        expertId,
        expertName: expert.name,
        expertAvatar: expert.avatar,
        doubtTitle: 'Doubt Discussion',
      });
    }
  };

  const handleDoubtSubmit = (doubt: {
    subject: string;
    topic: string;
    question: string;
  }) => {
    // Find an expert for the selected subject
    const expertForSubject = experts.find((e) => e.subject === doubt.subject);
    if (expertForSubject) {
      const newConversation: Conversation = {
        id: conversations.length + 1,
        expertId: expertForSubject.id,
        expertName: expertForSubject.name,
        subject: doubt.subject,
        question: doubt.topic,
        status: 'pending',
        lastMessage: doubt.question,
        timestamp: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setShowDoubtForm(false);

      // Auto-open chat
      setTimeout(() => {
        handleChatClick(expertForSubject.id);
      }, 500);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render as fullscreen modal when opened from Features
  if (onBack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <button
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          <div className="py-8 sm:py-12">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
                <HelpCircle size={18} />
                <span className="text-sm font-semibold">Expert Help Anytime</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Expert Doubt Solving
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Get one-on-one personalized doubt clearing sessions with experienced experts available 24/7
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="bg-white rounded-xl p-6 border border-teal-100 text-center">
                <div className="inline-flex p-3 rounded-lg bg-teal-100 mb-4">
                  <Users className="text-teal-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Expert Faculty</h3>
                <p className="text-sm text-gray-600">Experienced educators for all subjects</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-cyan-100 text-center">
                <div className="inline-flex p-3 rounded-lg bg-cyan-100 mb-4">
                  <MessageSquare className="text-cyan-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">1-on-1 Chat</h3>
                <p className="text-sm text-gray-600">Private conversations with experts</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-blue-100 text-center">
                <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-4">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">24/7 Available</h3>
                <p className="text-sm text-gray-600">Question our team any time</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-purple-100 text-center">
                <div className="inline-flex p-3 rounded-lg bg-purple-100 mb-4">
                  <Award className="text-purple-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Help</h3>
                <p className="text-sm text-gray-600">Response in minutes, not hours</p>
              </div>
            </div>

            {/* Active Conversations */}
            {conversations.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Conversations</h3>
                <div className="grid gap-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{conversation.expertName}</h4>
                          <span
                            className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full ${
                              conversation.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : conversation.status === 'active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">{conversation.question}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {conversation.lastMessage.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(conversation.timestamp)}</p>
                      </div>

                      {conversation.status !== 'resolved' && (
                        <button
                          onClick={() => handleChatClick(conversation.expertId)}
                          className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Continue Chat
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 sm:p-12 mb-16 text-white text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Have a Question?</h3>
              <p className="text-lg opacity-90 mb-8">
                Get personalized help from our expert faculty right now
              </p>
              <button
                onClick={() => setShowDoubtForm(true)}
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-200"
              >
                <span>Raise Your Doubt</span>
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Experts Grid */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Meet Our Experts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {experts.map((expert) => (
                  <ExpertProfile
                    key={expert.id}
                    expert={expert}
                    onChat={handleChatClick}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modals */}
          {showDoubtForm && (
            <DoubtForm
              onSubmit={handleDoubtSubmit}
              onClose={() => setShowDoubtForm(false)}
            />
          )}

          {activeChat && (
            <ExpertChat
              expertId={activeChat.expertId}
              expertName={activeChat.expertName}
              expertAvatar={activeChat.expertAvatar}
              doubtTitle={activeChat.doubtTitle}
              onClose={() => setActiveChat(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="expert-doubt" className="py-16 sm:py-24 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
            <HelpCircle size={18} />
            <span className="text-sm font-semibold">Expert Help Anytime</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Expert Doubt Solving
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Get one-on-one personalized doubt clearing sessions with experienced experts available 24/7
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-teal-100 text-center">
            <div className="inline-flex p-3 rounded-lg bg-teal-100 mb-4">
              <Users className="text-teal-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Expert Faculty</h3>
            <p className="text-sm text-gray-600">Experienced educators for all subjects</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-cyan-100 text-center">
            <div className="inline-flex p-3 rounded-lg bg-cyan-100 mb-4">
              <MessageSquare className="text-cyan-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">1-on-1 Chat</h3>
            <p className="text-sm text-gray-600">Private conversations with experts</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-blue-100 text-center">
            <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-4">
              <Clock className="text-blue-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">24/7 Available</h3>
            <p className="text-sm text-gray-600">Question our team any time</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-purple-100 text-center">
            <div className="inline-flex p-3 rounded-lg bg-purple-100 mb-4">
              <Award className="text-purple-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Help</h3>
            <p className="text-sm text-gray-600">Response in minutes, not hours</p>
          </div>
        </div>

        {/* Active Conversations */}
        {conversations.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Conversations</h3>
            <div className="grid gap-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900">{conversation.expertName}</h4>
                      <span
                        className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full ${
                          conversation.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : conversation.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">{conversation.question}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {conversation.lastMessage.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(conversation.timestamp)}</p>
                  </div>

                  {conversation.status !== 'resolved' && (
                    <button
                      onClick={() => handleChatClick(conversation.expertId)}
                      className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Continue Chat
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 sm:p-12 mb-16 text-white text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Have a Question?</h3>
          <p className="text-lg opacity-90 mb-8">
            Get personalized help from our expert faculty right now
          </p>
          <button
            onClick={() => setShowDoubtForm(true)}
            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-200"
          >
            <span>Raise Your Doubt</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Experts Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Meet Our Experts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts.map((expert) => (
              <ExpertProfile
                key={expert.id}
                expert={expert}
                onChat={handleChatClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDoubtForm && (
        <DoubtForm
          onSubmit={handleDoubtSubmit}
          onClose={() => setShowDoubtForm(false)}
        />
      )}

      {activeChat && (
        <ExpertChat
          expertId={activeChat.expertId}
          expertName={activeChat.expertName}
          expertAvatar={activeChat.expertAvatar}
          doubtTitle={activeChat.doubtTitle}
          onClose={() => setActiveChat(null)}
        />
      )}
    </section>
  );
}
