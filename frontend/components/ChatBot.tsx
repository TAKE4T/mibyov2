import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ja' | 'en';
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: language === 'ja' 
          ? 'こんにちは！未病診断に関するご質問がありましたら、お気軽にお聞かせください。例えば：\n• 症状について詳しく知りたい\n• 推奨される治療法について\n• 薬草蒸し療法について' 
          : 'Hello! Please feel free to ask me any questions about the mibyou diagnosis. For example:\n• Learn more about symptoms\n• About recommended treatments\n• About herbal steam therapy',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language]);

  const generateBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (language === 'ja') {
      if (lowercaseMessage.includes('症状') || lowercaseMessage.includes('不調')) {
        return '未病診断では、機能医学と伝統医学の両方の観点から症状を評価します。\n\n主な評価項目：\n• 自律神経系の不調\n• ホルモンバランスの変化\n• 免疫系の状態\n• 東洋医学の気血水精の状態\n\n具体的にどのような症状が気になりますか？';
      }
      
      if (lowercaseMessage.includes('蒸し') || lowercaseMessage.includes('治療')) {
        return '当システムでは、以下の薬草蒸し療法をご提案しています：\n\n🌿 リズム巡り蒸し（¥8,800）\n- ホルモンバランス調整\n- 月経不順や更年期症状に\n\n🌿 デトックス蒸し（¥7,200）\n- 免疫サポート・解毒\n- アレルギーやむくみに\n\n🌿 安眠ゆるり蒸し（¥9,500）\n- 自律神経調整\n- 不眠や不安症状に\n\nどの療法についてもっと詳しく知りたいですか？';
      }
      
      if (lowercaseMessage.includes('料金') || lowercaseMessage.includes('値段')) {
        return '薬草蒸し療法の料金について：\n\n• リズム巡り蒸し：¥8,800（30-40分）\n• デトックス蒸し：¥7,200（30-40分）\n• 安眠ゆるり蒸し：¥9,500（40-50分）\n\n推奨頻度：週1-3回\n初回お試し割引もございます。詳細はお問い合わせください。';
      }
      
      if (lowercaseMessage.includes('診断') || lowercaseMessage.includes('結果')) {
        return '診断結果は、あなたの回答を基に：\n\n📊 機能医学的評価\n- 自律神経、ホルモン、免疫系の状態\n\n🏥 伝統医学的評価  \n- 気血水精のバランス状態\n\n💡 個別化された推奨事項\n- 最適な薬草蒸し療法\n- ライフスタイルアドバイス\n- 注意事項\n\nをご提供します。まずは診断を開始してみてください！';
      }
      
      return 'ご質問ありがとうございます。未病診断や薬草蒸し療法について、もう少し具体的にお聞かせいただけますか？\n\n以下のトピックについてお答えできます：\n• 症状や体調について\n• 治療法について\n• 料金について\n• 診断の流れについて';
    } else {
      if (lowercaseMessage.includes('symptom') || lowercaseMessage.includes('condition')) {
        return 'The mibyou diagnosis evaluates symptoms from both functional medicine and traditional medicine perspectives.\n\nMain evaluation areas:\n• Autonomic nervous system disorders\n• Hormonal balance changes\n• Immune system status\n• Traditional medicine qi-blood-water-essence status\n\nWhat specific symptoms are you concerned about?';
      }
      
      if (lowercaseMessage.includes('treatment') || lowercaseMessage.includes('therapy')) {
        return 'Our system recommends the following herbal steam therapies:\n\n🌿 Rhythm Circulation Steam ($88)\n- Hormone balance adjustment\n- For menstrual irregularities and menopause\n\n🌿 Detox Steam ($72)\n- Immune support & detoxification\n- For allergies and swelling\n\n🌿 Peaceful Sleep Steam ($95)\n- Autonomic nervous regulation\n- For insomnia and anxiety\n\nWhich therapy would you like to learn more about?';
      }
      
      if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost')) {
        return 'Herbal steam therapy pricing:\n\n• Rhythm Circulation Steam: $88 (30-40 min)\n• Detox Steam: $72 (30-40 min)\n• Peaceful Sleep Steam: $95 (40-50 min)\n\nRecommended frequency: 1-3 times per week\nFirst-time discount available. Please contact us for details.';
      }
      
      return 'Thank you for your question. Could you be more specific about mibyou diagnosis or herbal steam therapy?\n\nI can answer questions about:\n• Symptoms and health conditions\n• Treatment methods\n• Pricing\n• Diagnosis process';
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputValue.trim()),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-green-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">
              {language === 'ja' ? '未病診断サポート' : 'Mibyou Diagnosis Support'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
              )}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                <div className="flex gap-1">
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
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'ja' ? 'メッセージを入力...' : 'Type a message...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;