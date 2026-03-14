"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBubble } from "./ChatBubble";
import { Send, Loader2 } from "lucide-react";
import type { TOrderItem } from "@/types";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  order?: { items: TOrderItem[]; total: number } | null;
  paymentUrl?: string | null;
};

type ChatWidgetProps = {
  shopId: string;
  shopName: string;
  welcomeMessage: string;
};

export function ChatWidget({
  shopId,
  shopName,
  welcomeMessage,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId,
          message: text,
          conversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        order: data.order || null,
        paymentUrl: data.paymentUrl || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: "Desole, une erreur est survenue. Reessayez.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5]">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 shadow-md flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-green-700 flex items-center justify-center text-lg font-bold">
          {shopName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-semibold text-base leading-tight">{shopName}</h1>
          <p className="text-green-100 text-xs">Click & Collect</p>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            order={msg.order}
            paymentUrl={msg.paymentUrl}
          />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start mb-2">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex-shrink-0 bg-gray-100 px-3 py-2 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          className="flex-1 h-11 px-4 rounded-full bg-white border border-gray-200 text-base outline-none focus:border-green-400 transition-colors"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-11 w-11 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-40 active:bg-green-600 transition-colors flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
