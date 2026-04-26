import React from 'react';
import { Headphones, Mic, PenTool, BookOpen, ScrollText, Terminal, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const PRACTICE_MODULES = [
  {
    id: 'listening',
    title: 'IELTS Listening',
    description: 'Listen to various accents and practice answering 40 questions.',
    icon: Headphones,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 dark:bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'reading',
    title: 'IELTS Reading',
    description: 'Improve your scanning and skimming skills with academic passages.',
    icon: BookOpen,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'writing',
    title: 'IELTS Writing',
    description: 'Master Task 1 and Task 2 with structured templates and feedback.',
    icon: PenTool,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    textColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'speaking',
    title: 'IELTS Speaking',
    description: 'Practice cue cards and follow-up questions with AI feedback.',
    icon: Mic,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 dark:bg-rose-500/10',
    textColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'guide',
    title: 'IELTS Guide',
    description: 'Everything you need to know about the exam format and scoring.',
    icon: ScrollText,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 dark:bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'environment',
    title: 'Practice Environment',
    description: 'A full simulated computer-delivered IELTS exam experience.',
    icon: Terminal,
    color: 'bg-slate-700',
    lightColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
  }
];

interface PracticeViewProps {
  onStartModule: (id: string) => void;
}

export function PracticeView({ onStartModule }: PracticeViewProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-0">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">IELTS Preparation</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
          Complete practice modules designed to boost your score across all four components of the IELTS exam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRACTICE_MODULES.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.button
              key={module.id}
              onClick={() => onStartModule(module.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-left hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className={`${module.lightColor} p-4 rounded-2xl mb-5 group-hover:scale-110 transition-transform`}>
                <Icon className={module.textColor} size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 leading-tight group-hover:text-indigo-500 transition-colors">
                {module.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                {module.description}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-indigo-500 dark:text-indigo-400">
                <span>Start Practice</span>
                <ChevronRight size={16} />
              </div>

              {/* Aesthetic background accent */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${module.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
