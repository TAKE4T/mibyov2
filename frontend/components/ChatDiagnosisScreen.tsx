import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// 診断の状態を明確に定義
type DiagnosisState = 
  | 'ready'            // 開始準備
  | 'asking'           // 質問中
  | 'waiting_answer'   // 回答待ち
  | 'completed';       // 完了

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>('ready');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初期化用useEffect
  useEffect(() => {
    console.log(`[ChatDiagnosis] Initial setup`);
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: language === 'ja' 
        ? 'こんにちは！未病診断へようこそ。\n\nこれから、あなたの体調や症状について27の質問をさせていただきます。機能医学と伝統医学の観点から、あなたに最適な健康アドバイスをご提供いたします。\n\n準備はよろしいですか？' 
        : 'Hello! Welcome to the Mibyou Diagnosis.\n\nI will ask you 27 questions about your health and symptoms. Based on functional medicine and traditional medicine perspectives, I will provide you with optimal health advice.\n\nAre you ready to begin?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    setDiagnosisState('ready');
  }, [language]);

  // 質問表示用useEffect
  useEffect(() => {
    console.log(`[ChatDiagnosis] State: ${diagnosisState}, Question: ${currentQuestionIndex}/${questions.length}`);
    
    if (diagnosisState === 'asking') {
      if (currentQuestionIndex < questions.length) {
        console.log(`[ChatDiagnosis] Showing question ${currentQuestionIndex}`);
        
        const question = questions[currentQuestionIndex];
        if (!question) {
          console.error(`[ChatDiagnosis] Question not found at index ${currentQuestionIndex}`);
          return;
        }
        
        const questionText = language === 'ja' ? question.question : question.questionEn;
        const options = language === 'ja' ? question.options : question.optionsEn;
        
        let questionMessage = `**質問 ${currentQuestionIndex + 1}/${questions.length}**\n\n${questionText}`;
        
        if (question.type === 'checkbox') {
          questionMessage += `\n\n${language === 'ja' ? '※複数選択可能です。選択が完了したら「次へ」ボタンを押してください。' : '※Multiple selection is possible. Press "Next" button when you finish selecting.'}`;
        }
        
        setSelectedOptions([]);
        addBotMessage(questionMessage, question.id, options);
        setDiagnosisState('waiting_answer');
      } else {
        console.log(`[ChatDiagnosis] All questions completed`);
        setDiagnosisState('completed');
      }
    }
    
    if (diagnosisState === 'completed') {
      console.log(`[ChatDiagnosis] Completing diagnosis`);
      const completeMessage = language === 'ja' 
        ? '全ての質問が完了しました！\n\nありがとうございます。あなたの回答を分析して、最適な健康アドバイスをご提供いたします。\n\n分析結果をご確認ください。' 
        : 'All questions completed!\n\nThank you. I will analyze your responses and provide optimal health advice.\n\nPlease check your analysis results.';
      
      addBotMessage(completeMessage);
      
      setTimeout(() => {
        onComplete(answers);
      }, 3000);
    }
  }, [diagnosisState, currentQuestionIndex, questions, language, addBotMessage, answers, onComplete]);

  const addBotMessage = useCallback((content: string, questionId?: string, options?: string[]) => {
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
    }, 1000);
  }, []);

  const addUserMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };



  const handleOptionClick = (option: string, questionId: string) => {
    console.log(`[ChatDiagnosis] Option clicked: ${option}, Current state: ${diagnosisState}`);
    
    // 状態チェック：回答待ち状態でのみ処理
    if (diagnosisState !== 'waiting_answer') {
      console.log(`[ChatDiagnosis] Option click ignored - not in waiting_answer state`);
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.type === 'checkbox') {
      // 複数選択の場合
      const isSelected = selectedOptions.includes(option);
      let newSelectedOptions;
      
      if (isSelected) {
        newSelectedOptions = selectedOptions.filter(opt => opt !== option);
      } else {
        newSelectedOptions = [...selectedOptions, option];
      }
      
      setSelectedOptions(newSelectedOptions);
      
      // 回答を保存
      const newAnswer: Answer = {
        questionId,
        value: newSelectedOptions.length > 0 ? newSelectedOptions : ['該当なし']
      };
      
      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== questionId);
        return [...filtered, newAnswer];
      });
      
    } else {
      // 単一選択の場合
      addUserMessage(option);
      
      const newAnswer: Answer = {
        questionId,
        value: option
      };
      
      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== questionId);
        return [...filtered, newAnswer];
      });

      // 次の質問へ移動
      console.log(`[ChatDiagnosis] Moving to next question: ${currentQuestionIndex} -> ${currentQuestionIndex + 1}`);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setDiagnosisState('asking');
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    // 状態チェック：回答待ち状態でのみ処理
    if (diagnosisState !== 'waiting_answer') return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.type === 'checkbox') {
      // 選択された項目をユーザーメッセージとして追加
      const selectedText = selectedOptions.length > 0 
        ? selectedOptions.join(', ') 
        : (language === 'ja' ? '該当なし' : 'None applicable');
      
      addUserMessage(selectedText);
      
      // 次の質問へ移動
      console.log(`[ChatDiagnosis] Moving to next question: ${currentQuestionIndex} -> ${currentQuestionIndex + 1}`);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setDiagnosisState('asking');
      }, 1500);
    }
  };

  const handleStart = () => {
    // 状態チェック：準備状態でのみ処理
    if (diagnosisState !== 'ready') return;
    
    addUserMessage(language === 'ja' ? 'はい、お願いします' : 'Yes, please');
    setTimeout(() => {
      const startMessage = language === 'ja' 
        ? 'それでは診断を開始いたします。各質問にお答えください。' 
        : 'Let\'s begin the diagnosis. Please answer each question.';
      
      addBotMessage(startMessage);
      
      setTimeout(() => {
        setDiagnosisState('asking');
      }, 2000);
    }, 1000);
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
        {message.type === 'bot' && message.options && message.questionId && diagnosisState === 'waiting_answer' && (
          <div className="mt-3 space-y-2" data-question-id={message.questionId}>
            {message.options.map((option, index) => {
              const currentQuestion = questions[currentQuestionIndex];
              const isSelected = currentQuestion?.type === 'checkbox' && selectedOptions.includes(option);
              
              return (
                <Button
                  key={index}
                  onClick={() => handleOptionClick(option, message.questionId!)}
                  className={`block w-full text-left text-sm border rounded-lg py-2 px-3 ${
                    isSelected 
                      ? 'bg-green-200 border-green-400 text-green-900'
                      : 'bg-green-50 hover:bg-green-100 text-green-800 border-green-200'
                  }`}
                  variant="outline"
                >
                  {currentQuestion?.type === 'checkbox' && (
                    <span className="mr-2">{isSelected ? '✓' : '○'}</span>
                  )}
                  {option}
                </Button>
              );
            })}
            
            {/* 複数選択の場合は次へボタンを表示 */}
            {questions[currentQuestionIndex]?.type === 'checkbox' && (
              <Button
                onClick={handleNextQuestion}
                className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={selectedOptions.length === 0}
              >
                {language === 'ja' ? '次へ' : 'Next'}
              </Button>
            )}
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
    <div 
      className="max-w-4xl mx-auto h-screen flex flex-col bg-gradient-to-b from-green-50 to-white"
      data-testid="chat-diagnosis"
    >
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
      {diagnosisState === 'ready' && (
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