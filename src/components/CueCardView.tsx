import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, MessageSquare, PlayCircle, Star, Book, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IELTS_SPEAKING_TOPICS, CueCard } from '../data/speakingTopics';

interface CueCardViewProps {
  onBack: () => void;
}

export function CueCardView({ onBack }: CueCardViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<CueCard | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [expandedFollowUp, setExpandedFollowUp] = useState<number | null>(null);

  const handleTopicSelect = (topic: CueCard) => {
    setSelectedTopic(topic);
    setShowModelAnswer(false);
    setExpandedFollowUp(null);
  };

  if (selectedTopic) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex flex-col gap-4"
      >
        <div className="flex items-center gap-3 mb-1">
          <button 
            onClick={() => setSelectedTopic(null)}
            className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-500 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">IELTS Speaking Part 02</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic Details & Model Answer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cue Card Display */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] border-2 border-indigo-500 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Book size={80} />
               </div>
               <div className="relative">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-md shadow-indigo-500/10">
                    <Sparkles size={10} /> Cue Card
                  </div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-4 leading-tight">
                    {selectedTopic.topic}
                  </h4>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You should say:</p>
                    <ul className="space-y-2">
                      {selectedTopic.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold text-sm">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  showModelAnswer 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10' 
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <BookOpen size={16} /> {showModelAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
              <button className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-500 hover:text-indigo-500 transition-all">
                <PlayCircle size={20} />
              </button>
            </div>
          </div>

          {/* Answer Section */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {showModelAnswer ? (
                <motion.div 
                  key="answer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-[1.5rem] border-2 border-emerald-500/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Model Answer</p>
                      <p className="text-[9px] font-bold text-slate-400">Band 8.0+ Performance</p>
                    </div>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-relaxed italic whitespace-pre-wrap">
                    "{selectedTopic.modelAnswer}"
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="followups"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-3"
                >
                  <div className="flex items-center gap-3 mb-2 pl-1">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Part 03 Follow-ups</p>
                      <p className="text-[9px] font-bold text-slate-400">Related Discussion</p>
                    </div>
                  </div>
                  
                  {selectedTopic.followUps.map((item, i) => (
                    <div 
                      key={i} 
                      className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-50 dark:border-slate-800 overflow-hidden transition-all hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <button 
                        onClick={() => setExpandedFollowUp(expandedFollowUp === i ? null : i)}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs leading-tight pr-4">
                          {item.question}
                        </p>
                        {expandedFollowUp === i ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </button>
                      <AnimatePresence>
                        {expandedFollowUp === i && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50 dark:bg-slate-900/50 p-4 pt-0 border-t border-slate-50 dark:border-slate-800"
                          >
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed mt-3">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-1">
        <button 
          onClick={onBack}
          className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-500 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">IELTS Speaking Cue Cards</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic List 02 - Speaking Part 02</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {IELTS_SPEAKING_TOPICS.map((topic, i) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleTopicSelect(topic)}
            className="group p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] border-2 border-slate-50 dark:border-slate-800 hover:border-indigo-500 transition-all text-left flex items-start gap-3 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black group-hover:scale-110 transition-transform text-xs">
              {i + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800 dark:text-slate-100 mb-0.5 group-hover:text-indigo-500 transition-colors leading-tight text-sm">
                {topic.topic}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Part 02</span>
                <div className="w-0.5 h-0.5 bg-slate-200 rounded-full" />
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                  <Star size={10} fill="currentColor" /> Answer included
                </span>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1" size={16} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
