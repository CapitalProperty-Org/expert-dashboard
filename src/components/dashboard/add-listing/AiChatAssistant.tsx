
import { useState } from 'react';
import { X, Send, Sparkles, RefreshCw, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import type { ListingState } from '../../../types';

interface AiChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    currentDescription: string;
    onAcceptDescription: (newDescription: string) => void;
    listingState: ListingState;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

const AiChatAssistant = ({ isOpen, onClose, currentDescription, onAcceptDescription, listingState }: AiChatAssistantProps) => {
    const { token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', text: 'Hi! I can help you write a better description. Tell me what tone you want (e.g., Professional, Cozy, Luxury) or just click "Rewrite" to get started.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleRewrite = async (customInstruction?: string) => {
        setIsLoading(true);
        // Add user message if custom instruction
        if (customInstruction) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: customInstruction }]);
        }

        try {
            const propertyDetails = {
                title: listingState.title,
                type: listingState.propertyType,
                bedrooms: listingState.bedrooms,
                bathrooms: listingState.bathrooms,
                size: listingState.size,
                amenities: listingState.amenities,
                location: listingState.googleAddress || 'Dubai'
            };

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/ai/rewrite-description`, {
                currentDescription,
                propertyDetails,
                tone: customInstruction || 'professional',
                length: 'medium'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newText = response.data.rewrittenText;

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                text: newText
            }]);

        } catch (error) {
            console.error('AI Error', error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: 'Sorry, I encountered an error while generating the description.' }]);
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        handleRewrite(input);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col h-[600px] m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="bg-violet-100 p-2 rounded-full">
                            <Sparkles className="text-violet-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-lg">AI Assistant</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white border text-gray-800 shadow-sm'}`}>
                                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                                {msg.role === 'assistant' && msg.id !== '1' && (
                                    <button
                                        onClick={() => onAcceptDescription(msg.text)}
                                        className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 transition-colors"
                                    >
                                        <Check size={14} />
                                        Use this description
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border p-3 rounded-lg shadow-sm flex items-center gap-2">
                                <RefreshCw className="animate-spin text-violet-500" size={16} />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            placeholder="e.g. Make it shorter and more punchy..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-violet-600 text-white p-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleRewrite()}
                        className="mt-2 text-xs text-violet-600 hover:underline flex items-center gap-1"
                    >
                        <Sparkles size={12} /> Auto-Rewrite Description
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiChatAssistant;
