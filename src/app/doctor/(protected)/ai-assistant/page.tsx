'use client';

import { useState, useRef, useEffect } from 'react';
import apiClient from '@/utils/api';
import { Send, Bot, User, Paperclip, X, Loader2, Sparkles, Copy, Check, Trash2, Stethoscope, Pill, FileText, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'ai';
  content: string;
  hasAttachment?: boolean;
}

const INITIAL_MESSAGE: Message = { 
  role: 'ai', 
  content: "Ready for clinical support. \n\nSelect an action or describe the patient case." 
};

const QUICK_ACTIONS = [
  { label: "Drug Interactions", icon: Pill, prompt: "Check for interactions between: " },
  { label: "Diff. Diagnosis", icon: Stethoscope, prompt: "Provide differential diagnosis for symptoms: " },
  { label: "Summarize Report", icon: FileText, prompt: "Summarize the attached medical report highlighting abnormalities." },
  { label: "Treatment Protocol", icon: Activity, prompt: "Standard treatment protocol for: " },
];

export default function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage (Client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sehat_cdss_chat');
      if (saved) setMessages(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('sehat_cdss_chat', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !selectedFile) return;

    const newMessage: Message = { 
      role: 'user', 
      content: textToSend, 
      hasAttachment: !!selectedFile 
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', textToSend);
      if (selectedFile) formData.append('file', selectedFile);

      const { data } = await apiClient.post('/api/ai/chat', formData);

      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      toast.error("System Offline");
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ **Network Error.** CDSS Unreachable." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if(confirm("Clear clinical session history?")) {
        setMessages([INITIAL_MESSAGE]);
        localStorage.removeItem('sehat_cdss_chat');
        toast.success("Session cleared");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 dark:bg-[#0f172a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      
      {/* Professional Header */}
      <div className="p-4 bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">SehatSahayak <span className="text-teal-600">Pro</span></h2>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Clinical Decision Support System</p>
            </div>
        </div>
        <button onClick={handleClearChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
            <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-800' : 'bg-teal-600'}`}>
                {msg.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-white"/>}
              </div>
              
              <div className={`relative group p-4 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700 pr-10'
              }`}>
                
                {msg.role === 'ai' && (
                  <button onClick={() => handleCopy(msg.content, index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === index ? <Check size={14}/> : <Copy size={14}/>}
                  </button>
                )}

                {msg.hasAttachment && (
                    <div className="mb-3 pb-2 border-b border-white/20 flex items-center gap-2 text-xs opacity-80">
                        <Paperclip size={12}/> <span>Clinical Document Analyzed</span>
                    </div>
                )}
                
                <div className="markdown-content leading-relaxed space-y-2">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({node, ...props}) => <span className="font-bold text-teal-700 dark:text-teal-400" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 marker:text-teal-500" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 marker:text-teal-500" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-3 mb-1 uppercase text-gray-600 dark:text-gray-400" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start ml-11">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1e293b] px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span className="text-xs text-gray-500 font-medium">Processing Medical Data...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions & Input */}
      <div className="bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
        
        {/* Quick Action Chips */}
        {!selectedFile && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {QUICK_ACTIONS.map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => {
                            if(action.label === "Summarize Report") toast("Please attach a report first");
                            else setInput(action.prompt);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap transition-colors"
                    >
                        <action.icon size={12} className="text-teal-600" />
                        {action.label}
                    </button>
                ))}
            </div>
        )}

        {selectedFile && (
          <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg border border-teal-100 dark:border-teal-800 w-fit">
            <Paperclip size={14} className="text-teal-600" />
            <span className="text-sm text-teal-700 dark:text-teal-300 font-medium truncate max-w-[200px]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-teal-600 hover:text-red-500"><X size={14}/></button>
          </div>
        )}

        <div className="flex items-end gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
          
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
            <Paperclip size={20} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Enter clinical query..."
            rows={1}
            className="flex-1 p-3 max-h-32 min-h-[48px] rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#0f172a] dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm"
          />

          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !selectedFile)} 
            className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}