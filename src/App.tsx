import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { GrammarTopics } from './components/GrammarTopics';
import { GrammarExplanation } from './components/GrammarExplanation';
import { Lesson } from './components/Lesson';
import { VocabView } from './components/VocabView';
import { PracticeView } from './components/PracticeView';
import { SpeakingView } from './components/SpeakingView';
import { ListeningView } from './components/ListeningView';
import { SmartCreator } from './components/SmartCreator';
import { SettingsView } from './components/SettingsView';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Camera } from 'lucide-react';
import localforage from 'localforage';

import { ROADMAP_MODULES } from './data/defaultTopics';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profileImage, setProfileImage] = useState<string | null>(() => localStorage.getItem('profileImage'));
  const [customTopics, setCustomTopics] = useState<any[]>(ROADMAP_MODULES);

  useEffect(() => {
    // Load custom topics
    Promise.all([
      localforage.getItem<any[]>('custom_topics'),
      localforage.getItem<boolean>('is_initialized')
    ]).then(([rawTopics, isInitialized]) => {
      let topics = rawTopics;
      if (topics) {
        topics = topics.map(topic => {
          if (topic.id?.toString().startsWith('custom-')) {
            return {
              ...topic,
              steps: topic.steps?.map((step: any) => ({
                ...step,
                subtitle: step.subtitle === 'AI Generated' ? '' : step.subtitle
              })),
              grammarData: topic.grammarData ? {
                ...topic.grammarData,
                content: topic.grammarData.content?.map((c: any) => ({
                  ...c,
                  keyPoints: c.keyPoints?.filter((kp: string) => kp !== 'AI Generated Note'),
                  examples: c.examples?.map((ex: any) => ({
                    ...ex,
                    bn: ex.bn === 'AI Generated Example' ? '' : ex.bn
                  }))
                }))
              } : undefined
            };
          }
          return topic;
        });
      }

      if (topics && isInitialized) {
        setCustomTopics(topics);
        localforage.setItem('custom_topics', topics); // Save sanitized data
      } else if (topics && !isInitialized) {
        // Migration for older users
        const hasBaseModules = topics.some(t => t.id === 'module-1' || t.id.toString().startsWith('module-'));
        if (!hasBaseModules) {
          const merged = [...ROADMAP_MODULES, ...topics];
          setCustomTopics(merged);
          localforage.setItem('custom_topics', merged);
        } else {
          setCustomTopics(topics);
          localforage.setItem('custom_topics', topics); // Save sanitized data
        }
        localforage.setItem('is_initialized', true);
      } else {
        // Completely new user
        setCustomTopics(ROADMAP_MODULES);
        localforage.setItem('custom_topics', ROADMAP_MODULES);
        localforage.setItem('is_initialized', true);
      }
    });

    const saved = localStorage.getItem('darkMode');
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem('profileImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [viewingGrammar, setViewingGrammar] = useState<{id: number, subtopicIdx: number, isCustom?: boolean} | null>(null);
  const [activePracticeModule, setActivePracticeModule] = useState<string | null>(null);
  const [pendingTextForAI, setPendingTextForAI] = useState<string>("");
  
  // Handlers for interacting with lessons
  const handleViewGrammar = (id: number, subtopicIdx: number = 0, isCustom: boolean = false) => setViewingGrammar({id, subtopicIdx, isCustom});
  const handleCloseGrammar = () => setViewingGrammar(null);
  
  const handleStartLesson = (id: number) => {
    setViewingGrammar(null);
    setActiveLessonId(id);
  };
  const handleCloseLesson = () => setActiveLessonId(null);
  const handleCompleteLesson = () => {
    setActiveLessonId(null);
  };

  const handleAIExtraction = (text: string) => {
    setPendingTextForAI(text);
    setActiveTab('creator');
  };

  const handleSearchSynonym = (word: string) => {
    // For now we might just log it or we could eventually search it
    // Setting activeTab to something else or just navigating inside if we had a dictionary feature
    console.log("Search for:", word);
    alert(`Search for synonym: ${word}`);
  };

  const handleStartPractice = (moduleId: string) => {
    setActivePracticeModule(moduleId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <AnimatePresence>
        {activeLessonId !== null && (
          <Lesson 
            key="lesson-view"
            onClose={handleCloseLesson} 
            onComplete={handleCompleteLesson} 
          />
        )}
        {viewingGrammar !== null && (
          <GrammarExplanation
            key="grammar-view"
            topicId={viewingGrammar.id}
            initialPage={viewingGrammar.subtopicIdx}
            isCustom={viewingGrammar.isCustom}
            customData={viewingGrammar.isCustom ? customTopics.find(t => t.steps[0].topicId === viewingGrammar.id)?.grammarData : undefined}
            onClose={handleCloseGrammar}
            onStartPractice={handleStartLesson}
          />
        )}
      </AnimatePresence>

      {/* Main App Layout (Hidden when lesson/grammar is active so no scrolling mess) */}
      <div 
        className={activeLessonId !== null || viewingGrammar !== null ? "hidden" : "flex w-full"}
      >
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'practice') setActivePracticeModule(null);
          }} 
          onStartPractice={handleStartPractice}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 bg-white dark:bg-slate-950 min-h-screen">
          <div className="flex items-center justify-between px-6 pt-8 pb-2 md:pt-6">
            <div className="md:hidden flex items-center gap-2">
              <div className="bg-indigo-500 text-white p-1.5 rounded-xl shadow-md">
                <GraduationCap size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-indigo-500 tracking-tight">GrammarBD</h1>
            </div>
            {/* Desktop spacer for mobile title */}
            <div className="hidden md:block" />

            <div className="relative group shrink-0">
              <label className="cursor-pointer block relative">
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                <img 
                  src={profileImage || "https://i.pravatar.cc/150?img=11"} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full shadow-sm border-2 border-slate-200 dark:border-slate-800 object-cover hover:border-indigo-500 transition-colors" 
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
              </label>
            </div>
          </div>
          
          <div className="pb-24 pt-4 px-0 md:pt-4 md:px-8">
            {activeTab === 'home' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                <div className="w-full max-w-4xl mx-auto">
                  <GrammarTopics 
                    onViewTopic={handleViewGrammar} 
                    customTopics={customTopics}
                    onUpdateTopic={async (updatedTopic) => {
                      const newTopics = customTopics.map(t => t.id === updatedTopic.id ? updatedTopic : t);
                      setCustomTopics(newTopics);
                      await localforage.setItem('custom_topics', newTopics);
                    }}
                    onDeleteTopic={async (topicId) => {
                      const newTopics = customTopics.filter(t => t.id !== topicId);
                      setCustomTopics(newTopics);
                      await localforage.setItem('custom_topics', newTopics);
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'vocab' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                <VocabView onSearchSynonym={handleSearchSynonym} />
              </motion.div>
            )}

            {activeTab === 'creator' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <SmartCreator 
                  initialText={pendingTextForAI}
                  onBack={() => {
                    setPendingTextForAI("");
                    setActiveTab('home');
                  }} 
                  onLessonCreated={(lesson) => {
                    setCustomTopics(prev => [...prev, lesson]);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <SettingsView onNavigateToAI={handleAIExtraction} />
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {activePracticeModule === 'speaking' ? (
                  <SpeakingView onBack={() => setActivePracticeModule(null)} />
                ) : activePracticeModule === 'listening' ? (
                  <ListeningView onBack={() => setActivePracticeModule(null)} />
                ) : (
                  <PracticeView onStartModule={handleStartPractice} />
                )}
              </motion.div>
            )}

            {activeTab !== 'home' && activeTab !== 'vocab' && activeTab !== 'practice' && activeTab !== 'creator' && activeTab !== 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 px-4 text-center"
              >
                <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner">
                  <span className="text-6xl">🚧</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Coming Soon</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-sm">This section is currently under development to bring you the best learning experience.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
