import { Star, MessageCircle } from 'lucide-react';

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

interface ExpertProfileProps {
  expert: Expert;
  onChat: (expertId: number) => void;
}

export default function ExpertProfile({ expert, onChat }: ExpertProfileProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <img
          src={expert.avatar}
          alt={expert.name}
          className="w-14 sm:w-16 h-14 sm:h-16 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{expert.name}</h3>
          <p className="text-xs sm:text-sm text-blue-600 font-semibold truncate">{expert.subject}</p>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`sm:size-{14} ${i < Math.floor(expert.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({expert.reviews})</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
        <p className="text-gray-700 truncate">
          <span className="font-semibold text-gray-900">Exp:</span> {expert.experience}
        </p>
        <p className="text-gray-700 truncate">
          <span className="font-semibold text-gray-900">Response:</span> {expert.responseTime}
        </p>
      </div>

      <button
        onClick={() => onChat(expert.id)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <MessageCircle size={16} className="sm:size-{18}" />
        Start Chat
      </button>
    </div>
  );
}
