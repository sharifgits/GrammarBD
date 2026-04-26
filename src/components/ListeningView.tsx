import React, { useState, useRef, useEffect } from 'react';
import { Headphones, ChevronLeft, Play, Pause, SkipForward, Book, Clock, Star, Download, Search, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTestsForBook, ListeningTest } from '../data/listeningTests';

interface ListeningViewProps {
  onBack: () => void;
}

const CAMBRIDGE_BOOKS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function ListeningView({ onBack }: ListeningViewProps) {
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [activeTest, setActiveTest] = useState<ListeningTest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tests = selectedBook ? getTestsForBook(selectedBook) : [];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let isMounted = true;

    const handlePlay = async () => {
      try {
        if (isPlaying) {
          await audio.play();
        } else {
          audio.pause();
        }
      } catch (e) {
        if (isMounted) {
          console.warn("Playback handled gracefully:", e);
        }
      }
    };

    handlePlay();

    return () => {
      isMounted = false;
    };
  }, [isPlaying, activeTest]);

  const handleBookSelect = (book: number) => {
    setSelectedBook(book);
    setActiveTest(null);
  };

  const handleTestSelect = (test: any) => {
    setActiveTest(test as ListeningTest);
    setIsPlaying(false);
    setCurrentTime(0);
    setUserAnswers({});
    setShowResults(false);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const calculateScore = () => {
    if (!activeTest) return { score: 0, total: 0 };
    let score = 0;
    let total = 0;
    activeTest.sections.forEach(s => {
      s.questions.forEach(q => {
        total++;
        if (userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
          score++;
        }
      });
    });
    return { score, total };
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden">
      {/* Audio Element */}
      {activeTest && activeTest.audioUrl && (
        <audio 
          ref={audioRef}
          src={activeTest.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={activeTest ? () => setActiveTest(null) : selectedBook ? () => setSelectedBook(null) : onBack}
            className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100 dark:hover:border-slate-600 group"
          >
            <ChevronLeft className="text-slate-600 dark:text-slate-300 group-hover:-translate-x-1 transition-transform" size={24} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Headphones className="text-indigo-500" size={24} />
              {activeTest ? `Book ${activeTest.book} — Test ${activeTest.testNumber}` : selectedBook ? `Cambridge IELTS ${selectedBook}` : 'Listening Library'}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {activeTest ? 'Practice Mode' : selectedBook ? 'Select a Test' : 'Cambridge Books 10 — 20'}
            </p>
          </div>
        </div>

        {!selectedBook && (
          <div className="hidden md:flex relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all w-64"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedBook ? (
          <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {CAMBRIDGE_BOOKS.map((book, idx) => (
              <motion.button
                key={book}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleBookSelect(book)}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent group-hover:opacity-0 transition-opacity" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-4xl md:text-5xl font-black text-indigo-500/20 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500 absolute top-4 right-4">
                    {book}
                  </span>
                  <div className="mt-auto">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Book</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{book}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : !activeTest ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {tests.map((test) => (
              <button 
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm text-indigo-500 font-black">
                    {test.testNumber}
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">Test {test.testNumber}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock size={14} /> {test.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all shadow-lg">
                  <Play size={18} />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Player Pane */}
            <div className="w-full lg:w-1/3 p-6 md:p-8 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center bg-slate-50/30 dark:bg-slate-800/20">
              <div className="relative w-48 h-48 mb-8">
                 <motion.div 
                   animate={{ scale: isPlaying ? [1, 1.05, 1] : 1, opacity: isPlaying ? [0.1, 0.15, 0.1] : 0.05 }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute inset-x-0 inset-y-0 bg-indigo-500 rounded-full blur-2xl"
                 />
                 <div className="relative w-full h-full p-3 bg-white dark:bg-slate-800 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-xl flex items-center justify-center">
                   <Book className="text-indigo-500/50" size={60} />
                 </div>
              </div>

              <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                 <input 
                   type="range"
                   min="0"
                   max={duration || 0}
                   value={currentTime}
                   onChange={handleSeek}
                   className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 mb-4"
                 />

                 <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-slate-400">{formatTime(currentTime)}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">{formatTime(duration)}</span>
                 </div>

                 <div className="flex items-center justify-center gap-6">
                    <button onClick={togglePlay} className="w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                      {isPlaying ? <Pause size={24} /> : <Play className="ml-1" size={24} />}
                    </button>
                    <button className="p-3 text-slate-400 hover:text-indigo-500 transition-colors">
                      <SkipForward size={24} />
                    </button>
                    <button onClick={() => { if(audioRef.current) { audioRef.current.currentTime = 0; setIsPlaying(false); } }} className="p-3 text-slate-400 hover:text-rose-500 transition-colors">
                      <RotateCcw size={24} />
                    </button>
                 </div>
              </div>

              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full p-6 bg-indigo-500 text-white rounded-3xl text-center"
                >
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Your Score</p>
                  <p className="text-4xl font-black">{calculateScore().score} / {calculateScore().total}</p>
                  <button 
                    onClick={() => setShowResults(false)}
                    className="mt-4 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all"
                  >
                    View Details
                  </button>
                </motion.div>
              )}
            </div>

            {/* Questions Pane */}
            <div className="flex-1 p-6 md:p-8 bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="max-w-2xl mx-auto space-y-12">
                {activeTest.sections.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-slate-400 font-medium">Questions for this test are currently being updated.</p>
                  </div>
                ) : (
                  activeTest.sections.map((section) => (
                    <div key={section.id} className="space-y-6">
                      <div className="border-b-2 border-slate-50 dark:border-slate-800 pb-4">
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{section.title}</h4>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{section.range}</p>
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl italic">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                          {section.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {section.questions.map((q) => (
                          <div key={q.id} className="group">
                            <div className="flex gap-4">
                              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 transition-all">
                                {q.id}
                              </span>
                              <div className="flex-1 space-y-3">
                                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                  {q.text}
                                </p>
                                
                                {q.type === 'fill' ? (
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="text"
                                      value={userAnswers[q.id] || ""}
                                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                      disabled={showResults}
                                      className={`max-w-[200px] px-4 py-2 border-b-2 bg-transparent focus:outline-none transition-all ${
                                        showResults 
                                          ? userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                                            ? 'border-emerald-500 text-emerald-600'
                                            : 'border-rose-500 text-rose-600'
                                          : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                                      }`}
                                      placeholder="Type answer here..."
                                    />
                                    {showResults && userAnswers[q.id]?.toLowerCase().trim() !== q.correctAnswer.toLowerCase().trim() && (
                                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                        Correct: {q.correctAnswer}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2">
                                    {q.options?.map((opt, i) => {
                                      const key = opt.charAt(0);
                                      const isSelected = userAnswers[q.id] === key;
                                      const isCorrect = q.correctAnswer === key;
                                      
                                      return (
                                        <button
                                          key={i}
                                          onClick={() => !showResults && handleAnswerChange(q.id, key)}
                                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-all flex items-center justify-between ${
                                            showResults
                                              ? isCorrect
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                : isSelected
                                                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                                  : 'border-slate-100 dark:border-slate-800 opacity-60'
                                              : isSelected
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-300'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                                          }`}
                                        >
                                          {opt}
                                          {showResults && isCorrect && <CheckCircle2 size={16} />}
                                          {showResults && isSelected && !isCorrect && <AlertCircle size={16} />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}

                {activeTest.sections.length > 0 && !showResults && (
                  <div className="pt-8 flex justify-center">
                    <button 
                      onClick={() => { setShowResults(true); setIsPlaying(false); }}
                      className="px-12 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                      <CheckCircle2 size={24} /> Submit Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Authentic Cambridge Material</p>
        {activeTest && (
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-widest">
               <Download size={14} /> PDF
             </button>
             <button className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 hover:underline uppercase tracking-widest">
               <Search size={14} /> Script
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
