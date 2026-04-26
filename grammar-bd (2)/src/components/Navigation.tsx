import React from 'react';
import { Home, BookOpen, BookA, User, Headphones, Mic, PenTool, BookOpen as BookOpenIcon, ScrollText, Terminal, Sparkles, Settings, GraduationCap } from 'lucide-react';
import { classNames } from '../lib/utils';
import { motion } from 'motion/react';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onStartPractice?: (module: string) => void;
}

const TABS = [
  { id: 'home', label: 'Learn', icon: Home },
  { id: 'practice', label: 'Practice', icon: BookOpen },
  { id: 'vocab', label: 'Vocab', icon: BookA },
  { id: 'creator', label: 'AI Creator', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PRACTICE_SUB = [
  { id: 'listening', label: 'Listening', icon: Headphones },
  { id: 'reading', label: 'Reading', icon: BookOpenIcon },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'guide', label: 'IELTS Guide', icon: ScrollText },
  { id: 'environment', label: 'Environment', icon: Terminal },
];

export function Navigation({ activeTab, setActiveTab, onStartPractice }: NavProps) {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 z-50 flex justify-between items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // If switching away from practice, might want to close sub-views, 
                // but we'll handle that in App.tsx
              }}
              className={classNames(
                "flex flex-col items-center justify-center w-full py-2 px-1 relative transition-colors",
                isActive ? "text-indigo-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="z-10 bg-transparent flex flex-col items-center">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                <span className={classNames("text-[10px] font-bold tracking-tight", isActive ? "opacity-100" : "opacity-80")}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex flex-col w-64 border-r-2 border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 p-4 pt-8 z-50">
        <div className="mb-10 px-4 flex items-center gap-2">
          <div className="bg-indigo-500 text-white p-1.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-indigo-500 dark:text-indigo-400 tracking-tight">GrammarBD</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={classNames(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl w-full text-left transition-all relative group",
                  isActive ? "text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-100 dark:border-indigo-500/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-bold tracking-wide uppercase">{tab.label}</span>
              </button>
            );
          })}

          <div className="mt-8 mb-2 px-4">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">IELTS Practice</span>
          </div>

          {PRACTICE_SUB.map((sub) => {
            const Icon = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveTab('practice');
                  if (onStartPractice) onStartPractice(sub.id);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left transition-all text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 group"
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">{sub.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
