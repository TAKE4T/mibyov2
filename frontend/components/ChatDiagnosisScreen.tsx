import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Bot, User, Send, RotateCcw } from 'lucide-react';
import type { Question, Answer } from '../App';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  questionId?: string;
  options?: string[];
}

interface ChatDiagnosisScreenProps {
  questions: Question[];
  onComplete: (answers: Answer[]) => void;
  language: 'ja' | 'en';
  onLanguageChange?: (language: 'ja' | 'en') => void;
}

export function ChatDiagnosisScreen({ questions, onComplete, language }: ChatDiagnosisScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 最初の挨拶メッセージ
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: language === 'ja' 
        ? 'こんにちは！未病診断へようこそ。\n\nこれから、あなたの体調や症状について27の質問をさせていただきます。機能医学と伝統医学の観点から、あなたに最適な健康アドバイスをご提供いたします。\n\n準備はよろしいですか？' 
        : 'Hello! Welcome to the Mibyou Diagnosis.\n\nI will ask you 27 questions about your health and symptoms. Based on functional medicine and traditional medicine perspectives, I will provide you with optimal health advice.\n\nAre you ready to begin?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);

  const addBotMessage = (content: string, questionId?: string, options?: string[]) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        questionId,
        options
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      if (questionId) {
        setWaitingForResponse(true);
      }
    }, 1000);
  };

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const startDiagnosis = () => {
    const startMessage = language === 'ja' 
      ? 'それでは診断を開始いたします。各質問にお答えください。' 
      : 'Let\'s begin the diagnosis. Please answer each question.';
    
    addBotMessage(startMessage);
    
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex >= questions.length) {
      completeDiagnosis();
      return;
    }

    const question = questions[currentQuestionIndex];
    const questionText = language === 'ja' ? question.question : question.questionEn;
    const options = language === 'ja' ? question.options : question.optionsEn;
    
    const questionMessage = `**質問 ${currentQuestionIndex + 1}/27**\n\n${questionText}`;
    
    addBotMessage(questionMessage, question.id, options);
  };

  const handleOptionClick = (option: string, questionId: string) => {
    // ユーザーの回答を追加
    addUserMessage(option);
    
    // 回答を保存
    const newAnswer: Answer = {
      questionId,
      value: option
    };
    
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, newAnswer];
    });

    setWaitingForResponse(false);
    setCurrentQuestionIndex(prev => prev + 1);

    // 次の質問を表示
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= questions.length) {
        completeDiagnosis();
      } else {
        askNextQuestion();
      }
    }, 1500);
  };

  const handleStart = () => {
    addUserMessage(language === 'ja' ? 'はい、お願いします' : 'Yes, please');
    setTimeout(() => {
      startDiagnosis();
    }, 1000);
  };

  const completeDiagnosis = () => {
    const completeMessage = language === 'ja' 
      ? '全ての質問が完了しました！\n\nありがとうございます。あなたの回答を分析して、最適な健康アドバイスをご提供いたします。\n\n分析結果をご確認ください。' 
      : 'All questions completed!\n\nThank you. I will analyze your responses and provide optimal health advice.\n\nPlease check your analysis results.';
    
    addBotMessage(completeMessage);
    
    setTimeout(() => {
      onComplete(answers);
    }, 3000);
  };

  const renderMessage = (message: ChatMessage) => (
    <div
      key={message.id}
      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {message.type === 'bot' && (
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-green-600" />
        </div>
      )}
      
      <div className={`max-w-md px-4 py-3 rounded-2xl ${
        message.type === 'user'
          ? 'bg-blue-500 text-white rounded-br-md'
          : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
      }`}>
        <div className="whitespace-pre-line text-sm leading-relaxed">
          {message.content}
        </div>
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {/* 選択肢ボタン */}
        {message.type === 'bot' && message.options && message.questionId && waitingForResponse && (
          <div className="mt-3 space-y-2">
            {message.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionClick(option, message.questionId!)}
                className="block w-full text-left text-sm bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 rounded-lg py-2 px-3"
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {message.type === 'user' && (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600" />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">
                {language === 'ja' ? '未病診断アシスタント' : 'Mibyou Diagnosis Assistant'}
              </h1>
              <p className="text-sm text-gray-500">
                {language === 'ja' ? 'オンライン' : 'Online'} • {currentQuestionIndex}/{questions.length}
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'ja' ? 'リセット' : 'Reset'}
          </Button>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {/* タイピングインジケーター */}
        {isTyping && (
          <div className="flex gap-3 justify-start mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-green-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
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

      {/* 開始ボタンエリア */}
      {messages.length === 1 && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex justify-center">
            <Button
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg"
            >
              {language === 'ja' ? '診断を開始する' : 'Start Diagnosis'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}