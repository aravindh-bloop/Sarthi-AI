import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X, MessageSquare, Loader2, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VoiceAssistant() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Namaste! I am your agricultural assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    language: i18n.language
                })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);

            // Mock Text-to-Speech trigger
            if (data.response) {
                console.log("Speaking:", data.response);
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I am having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 w-[90vw] md:w-96 mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-200" style={{ maxHeight: '600px', height: '500px' }}>

                    {/* Header */}
                    <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold">Krishi Sahayak</h3>
                                <p className="text-xs text-emerald-100">AI Advisory System</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full text-white/80 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                    <span className="text-xs text-gray-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" title="Voice Input (Mock)">
                            <Mic size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about crops, pests..."
                            className="flex-1 bg-gray-100 text-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-200 transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${isOpen ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/30'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && <span className="font-bold pr-1">Ask AI</span>}
            </button>
        </div>
    );
}
