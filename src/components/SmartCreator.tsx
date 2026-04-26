import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Loader2, CheckCircle2, ChevronLeft, Send, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateGrammarLesson } from '../services/geminiService';
import localforage from 'localforage';

interface SmartCreatorProps {
  onBack: () => void;
  onLessonCreated: (lesson: any) => void;
  initialText?: string;
}

export function SmartCreator({ onBack, onLessonCreated, initialText = "" }: SmartCreatorProps) {
  const [inputText, setInputText] = useState(initialText);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);

  // Constants for batch process
  const CHUNK_SIZE = 4000; // characters

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateGrammarLesson(inputText.substring(0, CHUNK_SIZE)); // just using first chunk for preview if single
      setPreview(result);
    } catch (err) {
      setError("AI generation failed. Please check your data and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoExtract = async () => {
    if (!inputText.trim()) return;
    setIsBatchProcessing(true);
    setError(null);
    
    try {
      const chunks = [];
      for (let i = 0; i < inputText.length; i += CHUNK_SIZE) {
        chunks.push(inputText.substring(i, i + CHUNK_SIZE));
      }
      setTotalChunks(chunks.length);
      
      const newTopics = [];
      let savedTopics = (await localforage.getItem<any[]>('custom_topics')) || [];
      const baseTopicId = 1000 + savedTopics.length; // Ensure no collision with defaults
      
      for (let idx = 0; idx < chunks.length; idx++) {
        setCurrentChunk(idx + 1);
        const result = await generateGrammarLesson(chunks[idx]);
        
        // Transform the result into a Grammar Module format
        const customModule = {
          id: `custom-${Date.now()}-${idx}`,
          title: result.title,
          description: result.description,
          steps: result.subtopics.map((sub: any, sIdx: number) => ({
            id: `custom-step-${Date.now()}-${sIdx}`,
            title: sub.title,
            subtitle: "",
            topicId: baseTopicId + idx,
            pageIdx: sIdx,
            status: 'completed'
          })),
          // Store the actual content inside the module for GrammarExplanation to read later
          grammarData: {
            title: result.title,
            subtitle: result.description,
            content: result.subtopics.map((sub: any) => ({
              title: sub.title,
              keyPoints: sub.keyPoints || [sub.content.substring(0, 50) + "..."],
              text: sub.content.replace(/\*/g, ''), // Strip any remaining asterisks
              examples: sub.examples || [],
              sourcePage: sub.sourcePage || ""
            }))
          }
        };
        
        newTopics.push(customModule);
        savedTopics.push(customModule);
        // Persist immediately so if it fails midway, we still keep chunks processed
        await localforage.setItem('custom_topics', savedTopics);
        onLessonCreated(customModule); // Notify parent to refresh
      }
      
      alert("All PDF information has been processed and permanently added as new topics!");
      onBack();
    } catch (err) {
      console.error(err);
      setError("Auto-Extraction paused or failed. Some parts might be processed.");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleSave = async () => {
    if (preview) {
      const savedTopics = (await localforage.getItem<any[]>('custom_topics')) || [];
      const baseTopicId = 1000 + savedTopics.length;
      
      const customModule = {
        id: `custom-${Date.now()}`,
        title: preview.title,
        description: preview.description,
        steps: preview.subtopics.map((sub: any, sIdx: number) => ({
          id: `custom-step-${Date.now()}-${sIdx}`,
          title: sub.title,
          subtitle: "",
          topicId: baseTopicId,
          pageIdx: sIdx,
          status: 'completed'
        })),
        grammarData: {
          title: preview.title,
          subtitle: preview.description,
          content: preview.subtopics.map((sub: any) => ({
            title: sub.title,
            keyPoints: sub.keyPoints || [sub.content.substring(0, 50) + "..."],
            text: sub.content.replace(/\*/g, ''), // Strip any remaining asterisks
            examples: sub.examples || [],
            sourcePage: sub.sourcePage || ""
          }))
        }
      };

      await localforage.setItem('custom_topics', [...savedTopics, customModule]);
      onLessonCreated(customModule);
      onBack();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[60vh] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-500/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} disabled={isBatchProcessing} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-indigo-500 disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} />
              AI Lesson Generator
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Auto Extract Course from Text</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {!preview && !isBatchProcessing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border-2 border-amber-100 dark:border-amber-900/30 flex gap-3">
               <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
               <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed space-y-2">
                 <p>পড়ুন: PDF থেকে আপনার প্রয়োজনীয় টেক্সট কপি করে নিচে পেস্ট করুন বা PDF ম্যানেজার থেকে টেক্সট পাঠান।</p>
                 <p><strong>Auto Extract:</strong> এই অপশনটি পুরো পিডিএফকে বারবার পড়ে নতুন নতুন টপিক অ্যাড করতে থাকবে যতদিন পিডিএফ এর তথ্য শেষ না হয়!</p>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Material</label>
               <textarea 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed"
                 placeholder="Paste text from your PDF here..."
               />
               <p className="text-[10px] text-slate-400 text-right font-bold">{inputText.length} characters</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-100 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest border-2 border-transparent"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                Generate Single
              </button>
              
              <button 
                onClick={handleAutoExtract}
                disabled={isGenerating || !inputText.trim()}
                className="flex-[2] py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 text-xs uppercase tracking-widest"
              >
                <Sparkles size={18} />
                Auto Extract & Save All Topics
              </button>
            </div>
          </motion.div>
        ) : isBatchProcessing ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-6">
             <div className="relative w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
               <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                 <circle
                   cx="64"
                   cy="64"
                   r="60"
                   stroke="currentColor"
                   strokeWidth="8"
                   fill="transparent"
                   className="text-indigo-500 transition-all duration-500"
                   strokeDasharray={377}
                   strokeDashoffset={377 - (377 * currentChunk) / Math.max(1, totalChunks)}
                 />
               </svg>
               <BookOpen size={32} className="text-indigo-500 animate-pulse" />
             </div>
             
             <div>
               <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Reading & Creating...</h3>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                 Processing Chunk {currentChunk} of {totalChunks}
               </p>
               <p className="text-[10px] text-slate-400 mt-2 max-w-sm mx-auto">
                 AI is scanning your PDF block by block and permanently generating new grammar topics. Please don't close this window.
               </p>
             </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-emerald-500/10 p-4 shadow-sm rounded-2xl border-2 border-emerald-500/10">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-md">
                    <CheckCircle2 size={18} />
                  </div>
                  <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">{preview.title}</h3>
               </div>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{preview.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Structure</h4>
                  {preview.subtopics.map((sub: any, i: number) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-xl">
                      <p className="font-black text-xs text-slate-800 dark:text-slate-200 mb-0.5">{sub.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{sub.content.substring(0, 50)}...</p>
                    </div>
                  ))}
               </div>

               <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Assessment</h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {preview.quiz?.length || 0} Interactive questions generated.
                    </p>
                  </div>
               </div>
            </div>

            <div className="flex gap-3">
               <button 
                 onClick={() => setPreview(null)}
                 className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-xl hover:bg-slate-200 text-[10px] uppercase tracking-widest"
               >
                 Back
               </button>
               <button 
                 onClick={handleSave}
                 className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all text-[10px] uppercase tracking-widest"
               >
                 Save Lesson
               </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
