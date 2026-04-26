import React, { useState } from 'react';
import { X, Heart, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { classNames } from '../lib/utils';

interface LessonProps {
  key?: string;
  onClose: () => void;
  onComplete: () => void;
}

const LESSON_DATA = [
  {
    type: 'translate_en_to_bn',
    question: 'How do you say "Water"?',
    options: ['পানি (Pani)', 'আগুন (Agun)', 'মাটি (Mati)', 'বাতাস (Batas)'],
    answer: 0,
  },
  {
    type: 'translate_bn_to_en',
    question: 'What does "ভালোবাসা" (Bhalobasha) mean?',
    options: ['Hate', 'Love', 'Anger', 'Peace'],
    answer: 1,
  },
  {
    type: 'fill_in_the_blank',
    question: 'I ___ an apple.',
    options: ['am', 'is', 'eat', 'eats'],
    answer: 2,
  }
];

export function Lesson({ onClose, onComplete }: LessonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [hearts, setHearts] = useState(5);
  
  const currentQ = LESSON_DATA[currentIndex];
  const isCorrect = selectedOption === currentQ.answer;

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    setIsChecked(true);
    if (!isCorrect) {
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (currentIndex < LESSON_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col md:p-4">
      {/* Lesson Header */}
      <div className="flex items-center justify-between p-4 px-6 md:max-w-3xl md:mx-auto w-full pt-8">
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2">
          <X size={28} strokeWidth={2.5} />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 mx-4 sm:mx-8 relative">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: `${(currentIndex / LESSON_DATA.length) * 100}%` }}
              animate={{ width: `${((isChecked && isCorrect ? currentIndex + 1 : currentIndex) / LESSON_DATA.length) * 100}%` }}
              transition={{ ease: "easeInOut", duration: 0.5 }}
            />
          </div>
          {/* Highlight glare */}
          <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full mix-blend-overlay" />
        </div>

        <div className="flex items-center gap-2 font-bold text-rose-500">
          <Heart fill="currentColor" size={24} />
          <span className="text-lg">{hearts}</span>
        </div>
      </div>

      {/* Lesson Content Area */}
      <div className="flex-1 overflow-y-auto px-4 w-full md:max-w-2xl md:mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 py-8"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {currentQ.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                let optionStyle = "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                
                if (isSelected && !isChecked) {
                  optionStyle = "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400";
                } else if (isChecked && isSelected) {
                  optionStyle = isCorrect 
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500" 
                    : "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500";
                } else if (isChecked && i === currentQ.answer) {
                  // Show the correct answer if they got it wrong
                  optionStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500";
                }

                return (
                  <button
                    key={i}
                    disabled={isChecked}
                    onClick={() => setSelectedOption(i)}
                    className={classNames(
                      "p-4 sm:p-5 rounded-2xl border-2 border-b-4 text-left font-bold text-lg sm:text-zinc-700 dark:sm:text-slate-200 transition-all active:border-b-2 active:mt-[2px]",
                      optionStyle,
                      isChecked && "cursor-default active:border-b-4 active:mt-0"
                    )}
                  >
                    <span className="text-slate-400 mr-2 sm:mr-3 text-base">{i + 1}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Area (Check / Continue) */}
      <div className={classNames(
        "border-t-2 border-slate-200 dark:border-slate-800 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:p-6 transition-colors duration-300",
        isChecked && isCorrect ? "bg-emerald-100 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-900" :
        isChecked && !isCorrect ? "bg-rose-100 border-rose-200 dark:bg-rose-950 dark:border-rose-900" : "bg-white dark:bg-slate-900"
      )}>
        <div className="w-full md:max-w-4xl md:mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div className="w-full sm:w-auto flex-1 font-bold">
            {isChecked && isCorrect && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-full"><Check strokeWidth={3} /></div>
                <span className="text-xl">Great job!</span>
              </motion.div>
            )}
            {isChecked && !isCorrect && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-rose-600 dark:text-rose-500 flex items-center gap-2">
                <div className="bg-white dark:bg-slate-800 p-2 text-rose-500 rounded-full"><X strokeWidth={3} /></div>
                <div className="flex flex-col">
                  <span className="text-xl">Correct solution:</span>
                  <span className="font-normal">{currentQ.options[currentQ.answer]}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="w-full sm:w-48 shrink-0">
            {!isChecked ? (
              <Button 
                variant={selectedOption !== null ? 'primary' : 'secondary'}
                disabled={selectedOption === null}
                onClick={handleCheck}
              >
                CHECK
              </Button>
            ) : (
              <Button 
                variant={isCorrect ? 'success' : 'danger'}
                onClick={handleNext}
              >
                CONTINUE
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
