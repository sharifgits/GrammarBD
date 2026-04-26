import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, MessageSquare, MessageCircle, MoreVertical, Maximize, User, Sparkles, Send, Loader2, BookOpen, Brain, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { CueCardView } from './CueCardView';

interface SpeakingViewProps {
  onBack: () => void;
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type ViewMode = 'selection' | 'ai-chat' | 'cue-cards';

export function SpeakingView({ onBack }: SpeakingViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  
  // AI Chat States
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callMode, setCallMode] = useState<'video' | 'audio'>('video');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState({ name: "Sarah", role: "English Friend", video: "https://cdn.pixabay.com/video/2021/04/12/70860-537452601_tiny.mp4", voice: "female", lang: "en-US" });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [partnerAnimation, setPartnerAnimation] = useState<'idle' | 'speaking' | 'listening' | 'nodding'>('idle');
  const [time, setTime] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [conversationHistory, setConversationHistory] = useState<{ role: string, text: string }[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const greeting = `Hi! I'm ${selectedPartner.name}, your conversation partner. I'm excited to chat with you today!`;
    setCurrentPrompt(greeting);
  }, [selectedPartner]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setUserTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setUserTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Animation triggers
  useEffect(() => {
    if (isLoading) {
      setPartnerAnimation('listening');
    } else if (window.speechSynthesis.speaking) {
      setPartnerAnimation('speaking');
    } else {
      setPartnerAnimation('idle');
    }
  }, [isLoading]);

  // Eye blinking simulation
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    if (!isSessionActive) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 4000 + 2000);
    return () => clearInterval(blinkInterval);
  }, [isSessionActive]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    setPartnerAnimation('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Select voice based on partner profile and language
    // Prioritize high quality "Google" or "Neural" voices which sound much more human
    let preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural')) && v.lang.startsWith('en') && v.name.toLowerCase().includes(selectedPartner.voice));
    
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes(selectedPartner.voice)) ||
                       voices.find(v => v.lang.startsWith('en')) || 
                       voices[0];
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.88; // Slightly slower for natural feel
    utterance.pitch = selectedPartner.voice === 'female' ? 1.02 : 0.95;
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      setPartnerAnimation('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const generateNextPrompt = async () => {
    if (!userTranscript && conversationHistory.length > 0) return;
    
    setIsLoading(true);
    setPartnerAnimation('nodding');
    const history = [...conversationHistory, { role: 'user', text: userTranscript }];
    setConversationHistory(history);
    
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a friendly and engaging conversation partner named ${selectedPartner.name}. 
          Conduct a casual and natural conversation in English. 
          Avoid being overly formal. Ask follow-up questions, share "thoughts," and keep the dialogue flowing naturally. 
          Respond with warmth and interest.`,
        },
        contents: history.map(h => ({ 
          role: h.role === 'user' ? 'user' : 'model', 
          parts: [{ text: h.text }] 
        })),
      });

      const nextText = response.text || "That's interesting. Let's move on to the next question.";
      setCurrentPrompt(nextText);
      setConversationHistory(prev => [...prev, { role: 'model', text: nextText }]);
      setUserTranscript("");
      speak(nextText);
    } catch (error) {
      console.error("Gemini Error:", error);
      setPartnerAnimation('idle');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isListening) {
      setPartnerAnimation('listening');
    } else if (!isLoading && !window.speechSynthesis.speaking) {
      setPartnerAnimation('idle');
    }
  }, [isListening]);

  useEffect(() => {
    let interval: any;
    if (isSessionActive) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
      // Speak initial prompt
      setTimeout(() => speak(currentPrompt), 1000);
    }
    return () => {
      clearInterval(interval);
      window.speechSynthesis.cancel();
    };
  }, [isSessionActive]);

  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Camera/Microphone permission was denied. Please allow access in your browser settings and refresh.");
      } else {
        setCameraError("Could not access camera. Please ensure it's not being used by another app.");
      }
      // Attempt audio-only if video fails, or just stay in error state
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (isSessionActive && !isCameraOff) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isSessionActive, isCameraOff]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateFeedback = async () => {
    setIsLoading(true);
    setShowFeedback(true);
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are an expert conversation coach. 
          Provide a brief, constructive feedback report based on the provided conversation transcript.
          Focus on how the user can improve their natural flow, conversation fillers, and vocabulary for casual chat.
          Keep it very encouraging and friendly.`,
        },
        contents: [{ 
          role: 'user', 
          parts: [{ text: "Transcript of my IELTS speaking attempt: " + conversationHistory.map(h => `${h.role}: ${h.text}`).join('\n') }] 
        }],
      });

      setFeedback(response.text || "You did a great job! Keep practicing to improve your vocabulary and flow.");
    } catch (error) {
      console.error("Feedback Error:", error);
      setFeedback("Great effort today! Consistent practice will help you achieve your target band score.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showFeedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-6">
          <Sparkles size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-6 tracking-tight">Performance Summary</h2>
        
        <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8 whitespace-pre-wrap text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
               <Loader2 className="animate-spin text-indigo-500" size={32} />
               <p className="text-sm font-bold text-slate-400">Sarah is analyzing your performance...</p>
            </div>
          ) : (
            feedback
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => {
                setShowFeedback(false);
                setIsSessionActive(false);
                setConversationHistory([]);
            }}
            className="px-10 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all active:scale-95"
          >
            Practice Again
          </button>
          <button 
             onClick={onBack}
             className="px-10 py-3 text-slate-500 font-bold"
          >
            Main Menu
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'cue-cards') {
    return (
      <div className="flex flex-col min-h-[80vh] p-6 bg-slate-50/30 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800">
        <CueCardView onBack={() => setViewMode('selection')} />
      </div>
    );
  }

  if (viewMode === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
          <MessageCircle size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Speaking Practice</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 text-sm font-medium text-center">
          Improve your fluency with AI conversation or master IELTS Part 2 cue cards.
        </p>

        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <button 
             onClick={() => setViewMode('ai-chat')}
             className="group p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain size={100} />
             </div>
             <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Mic size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-500 transition-colors">AI Voice Chat</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Casual Fluency</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
               Practice natural conversations with your AI partners, Sarah and James.
             </p>
             <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest">
               Start Chat <ChevronRight size={16} />
             </div>
           </button>

           <button 
             onClick={() => setViewMode('cue-cards')}
             className="group p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 relative overflow-hidden"
           >
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={100} />
             </div>
             <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
             </div>
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 group-hover:text-emerald-500 transition-colors">IELTS Cue Cards</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Exam Mastery</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
               Master IELTS Speaking Part 2 with actual topics and band 8.0+ model answers.
             </p>
             <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
               Browse Topics <ChevronRight size={16} />
             </div>
           </button>
        </div>

        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-slate-600 font-bold text-sm tracking-widest uppercase"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (viewMode === 'ai-chat' && !isSessionActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-y-auto">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
          <MessageCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">AI Voice Chat</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-sm font-medium text-center">
          Choose a partner to start a natural, friendly chat.
        </p>

        <div className="w-full max-w-md gap-6 mb-8">
          {/* Partner Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">Select Partner</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: "Sarah", role: "English Friend", video: "https://cdn.pixabay.com/video/2021/04/12/70860-537452601_tiny.mp4", voice: "female", lang: "en-US" },
                { name: "James", role: "Conversation Partner", video: "https://cdn.pixabay.com/video/2021/04/12/70817-537452613_tiny.mp4", voice: "male", lang: "en-US" }
              ].map((partner) => (
                <button 
                  key={partner.name}
                  onClick={() => setSelectedPartner(partner)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                    selectedPartner.name === partner.name 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${partner.voice === 'female' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                    {partner.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{partner.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{partner.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Call Mode Selection */}
        <div className="w-full max-w-2xl mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
           <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block mb-4 text-center">Connection Type</label>
           <div className="flex gap-4 justify-center">
             <button 
               onClick={() => setCallMode('video')}
               className={`flex-1 max-w-[160px] py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                 callMode === 'video' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 ring-2 ring-indigo-500/20' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               <Video size={18} /> Video Call
             </button>
             <button 
               onClick={() => setCallMode('audio')}
               className={`flex-1 max-w-[160px] py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                 callMode === 'audio' ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600 ring-2 ring-emerald-500/20' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               <Mic size={18} /> Voice Call
             </button>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setViewMode('selection')}
            className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => setIsSessionActive(true)}
            className="px-10 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col md:p-6 p-0 overflow-hidden">
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="bg-rose-500 px-3 py-1 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-tighter">Live Conversation</span>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
          <span className="text-xs font-mono text-white/80">{formatTime(time)}</span>
        </div>
      </div>

      {/* Main Video/Audio Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {callMode === 'audio' ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
             {/* Gemini Style Voice UI */}
             <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                {/* Background Glow */}
                <motion.div 
                  animate={{ 
                    scale: partnerAnimation === 'speaking' ? [1, 1.2, 1] : 1,
                    opacity: partnerAnimation === 'speaking' ? [0.1, 0.2, 0.1] : 0.05 
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-indigo-500 rounded-full blur-[80px]"
                />
                
                {/* Animated Rings */}
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ 
                      scale: partnerAnimation === 'speaking' ? [1, 1.3 + (i * 0.1), 1] : 1,
                      opacity: partnerAnimation === 'speaking' ? [0.15, 0, 0.15] : 0.05
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3, 
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 border-2 border-indigo-400/30 rounded-full"
                  />
                ))}

                {/* Central Circle */}
                <motion.div 
                  className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center border border-white/20 overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.2)] ${
                    partnerAnimation === 'speaking' ? 'bg-indigo-500/10' : 'bg-slate-900'
                  }`}
                >
                  <div className={`text-center transition-opacity duration-300 ${partnerAnimation === 'speaking' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-3 shadow-xl ${
                      selectedPartner.voice === 'female' ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}>
                      {selectedPartner.name[0]}
                    </div>
                    <p className="text-white text-sm font-black tracking-widest uppercase">{selectedPartner.name}</p>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">AI Friend</p>
                  </div>

                  {/* Audio Waveform during speaking */}
                  {partnerAnimation === 'speaking' && (
                    <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [h*2, h*6, h*2] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.05 }}
                          className="w-1 bg-indigo-400 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Status Indicator */}
                <div className="absolute -bottom-12 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : partnerAnimation === 'speaking' ? 'bg-indigo-400 animate-pulse' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                      {isListening ? 'Listening...' : partnerAnimation === 'speaking' ? `${selectedPartner.name} is speaking` : 'Ready to chat'}
                    </span>
                  </div>
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full"
                    >
                      <p className="text-[10px] font-bold text-emerald-400 line-clamp-1 italic">
                        "{userTranscript || '...'}"
                      </p>
                    </motion.div>
                  )}
                </div>
             </div>
          </div>
        ) : (
          /* Mock Interviewer View (Video Mode) */
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-none md:rounded-[3rem] overflow-hidden shadow-2xl relative">
            <motion.div 
              className="w-full h-full relative"
              animate={
                  partnerAnimation === 'speaking' ? { 
                      scale: [1, 1.01, 1], 
                      rotate: [0, 0.2, -0.2, 0],
                      y: [0, -1, 0] 
                  } : partnerAnimation === 'listening' ? {
                      scale: 1.03,
                      y: 5
                  } : partnerAnimation === 'nodding' ? {
                      y: [0, 10, 0, 8, 0]
                  } : {
                      scale: 1,
                      y: 0,
                      rotate: 0
                  }
              }
              transition={
                  partnerAnimation === 'speaking' ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : 
                  partnerAnimation === 'listening' ? { duration: 1, ease: "easeOut" } :
                  { duration: 0.8 }
              }
            >
              <video 
                  src={selectedPartner.video} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-90 brightness-90 contrast-110"
              />
              
              {/* Blink Overlay - Simulated by a quick light dimming */}
              <AnimatePresence>
                  {isBlinking && (
                      <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="absolute inset-0 bg-black pointer-events-none"
                      />
                  )}
              </AnimatePresence>

              {/* Mouth Interaction Area - Vertical scale pulse for lip sync effect */}
              <AnimatePresence>
                  {partnerAnimation === 'speaking' && (
                      <motion.div 
                          animate={{ 
                              scaleY: [1, 1.2, 0.9, 1.1, 1],
                              scaleX: [1, 1.05, 0.95, 1.02, 1],
                              opacity: [0.3, 0.5, 0.3] 
                          }}
                          transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                          className="absolute top-[62%] left-1/2 -translate-x-1/2 w-20 h-10 bg-indigo-400/20 blur-xl rounded-full pointer-events-none"
                      />
                  )}
              </AnimatePresence>

              {/* Dynamic HUD corners */}
              <div className="absolute inset-x-8 top-8 flex justify-between pointer-events-none opacity-30">
                  <div className="w-6 h-6 border-t border-l border-white/50 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t border-r border-white/50 rounded-tr-lg" />
              </div>
              <div className="absolute inset-x-8 bottom-8 flex justify-between pointer-events-none opacity-30">
                  <div className="w-6 h-6 border-b border-l border-white/50 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b border-r border-white/50 rounded-br-lg" />
              </div>
            </motion.div>
            
            {/* AI Prompts removed to fulfill user request */}

            <div className="absolute top-10 right-10 flex flex-col gap-3">
               <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 border border-white/10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${selectedPartner.voice === 'female' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                      {selectedPartner.name[0]}
                  </div>
                  <div className="text-left">
                      <p className="text-white font-bold text-xs uppercase tracking-wider">{selectedPartner.name}</p>
                      <p className="text-white/40 text-[10px]">{selectedPartner.role}</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* User PiP (Only in video mode) */}
        {callMode === 'video' && (
          <div className="absolute bottom-28 right-6 md:right-10 md:bottom-32 w-32 h-44 md:w-48 md:h-64 bg-slate-800 rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden group">
            {cameraError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-rose-950/20 p-4 text-center">
                <VideoOff size={32} className="text-rose-500 mb-2" />
                <p className="text-[10px] font-bold text-rose-200 leading-tight">{cameraError}</p>
              </div>
            ) : isCameraOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <User size={48} className="text-slate-600" />
              </div>
            ) : (
              <video 
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">You</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-24 md:h-32 flex items-center justify-center px-6">
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-[2.5rem]">
          <button 
            onClick={toggleListening}
            className={`p-4 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${
              isListening ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            <span className="text-xs font-black uppercase hidden lg:block">{isListening ? 'Listening...' : 'Push to Talk'}</span>
          </button>

          <button 
            onClick={() => setIsCameraOff(!isCameraOff)}
            className={`p-4 rounded-2xl transition-all active:scale-95 flex items-center gap-2 ${
              isCameraOff ? 'bg-rose-500/20 text-rose-500' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            <span className="text-xs font-black uppercase hidden lg:block">{isCameraOff ? 'Camera Off' : 'Camera On'}</span>
          </button>
          
          <button 
            onClick={generateNextPrompt}
            disabled={!userTranscript && conversationHistory.length > 0 || isLoading}
            className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center gap-3 px-6 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            <span className="font-bold hidden md:block">Send Answer</span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 mx-2" />

          <button 
            onClick={() => {
                if (conversationHistory.length > 1) {
                  generateFeedback();
                } else {
                  setIsSessionActive(false);
                  onBack();
                }
            }}
            className="p-4 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl flex items-center gap-2 px-6 shadow-xl shadow-rose-900/40 transition-all active:scale-95"
          >
            <PhoneOff size={24} />
            <span className="font-bold hidden md:block">End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
