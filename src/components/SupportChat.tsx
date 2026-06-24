/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  CornerDownRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { SupportMessage } from "../types";

interface SupportChatProps {
  currentLang: "en" | "ar";
}

export default function SupportChat({ currentLang }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: currentLang === "ar" 
        ? "مرحباً بك في مينغا.كوم! أنا مساعدك الذكي الخاص بخدمة العملاء. كيف يمكنني مساعدتك اليوم بخصوص منتجاتنا، الشحن لولايتك، أو طرق الدفع؟" 
        : "Welcome to Minga.com! I am your AI Shopping Assistant. How can I assist you with our products, shipping to your Wilaya, or payment methods today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAr = currentLang === "ar";

  const quickQuestions = isAr ? [
    "كم تكلفة التوصيل لوهران وقسنطينة؟",
    "ما هي طرق الدفع المتوفرة لديكم؟",
    "هل عطر عود الجزائر متوفر حالياً؟",
    "كيف يمكنني تتبع طلبي؟"
  ] : [
    "How much is delivery to Oran or Constantine?",
    "What payment methods do you support?",
    "Is Oud Al-Jazaïr perfume in stock?",
    "How do I track my order?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Adjust welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === "welcome") {
        return [{
          id: "welcome",
          sender: "assistant",
          text: currentLang === "ar" 
            ? "مرحباً بك في مينغا.كوم! أنا مساعدك الذكي الخاص بخدمة العملاء. كيف يمكنني مساعدتك اليوم بخصوص منتجاتنا، الشحن لولايتك، أو طرق الدفع؟" 
            : "Welcome to Minga.com! I am your AI Shopping Assistant. How can I assist you with our products, shipping to your Wilaya, or payment methods today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [currentLang]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: SupportMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();
      
      const botMessage: SupportMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: SupportMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "assistant",
        text: isAr 
          ? "عذراً، واجهت مشكلة في الاتصال بالسيرفر. يرجى تكرار المحاولة." 
          : "Sorry, I had an issue contacting our servers. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="support-chat-wrapper">
      {/* Expanding Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[520px] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300 transform scale-100 origin-bottom-right" id="chat-expanded-panel">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5 font-sans">
                  <span>{isAr ? "مساعد مينغا الذكي" : "Minga AI Assistant"}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h4>
                <p className="text-[10px] text-indigo-200 mt-0.5">
                  {isAr ? "مدعوم بالذكاء الاصطناعي من جوجل" : "Powered by Gemini AI Engine"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1.5 rounded-lg transition"
              id="close-chat-panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900/50 space-y-3.5">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-sm" 
                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-700/60 rounded-tl-sm shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-neutral-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start max-w-[85%] mr-auto">
                <div className="bg-white dark:bg-neutral-800 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-700/60 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply suggestions */}
          <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-1.5 overflow-x-auto scrollbar-none">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-neutral-800 dark:hover:bg-neutral-700/50 dark:text-neutral-300 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium py-1.5 px-3 rounded-full transition-all flex items-center gap-1"
              >
                <CornerDownRight size={10} className="text-indigo-500" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Footer input form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-2"
          >
            <input
              type="text"
              placeholder={isAr ? "اكتب رسالة للمساعد..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
              id="send-chat-msg"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group cursor-pointer transition-transform hover:scale-105"
        id="toggle-floating-chat-bubble"
      >
        {isOpen ? <X size={24} /> : (
          <div className="flex items-center gap-2">
            <MessageSquare size={24} className="group-hover:rotate-6 transition-transform" />
            <span className="text-xs font-bold font-sans hidden sm:inline max-w-0 group-hover:max-w-24 overflow-hidden transition-all duration-300">
              {isAr ? "تحدث معنا" : "AI Support"}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
