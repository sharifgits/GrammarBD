import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Target, Zap, ArrowRight, Check, Lock, Star, Edit2, Trash2, ShieldCheck, X } from 'lucide-react';
import { classNames } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface GrammarTopicsProps {
  onViewTopic: (topicId: number, subtopicIdx?: number, isCustom?: boolean) => void;
  customTopics?: any[];
  onUpdateTopic?: (updatedTopic: any) => void;
  onDeleteTopic?: (topicId: string) => void;
}

export function GrammarTopics({ onViewTopic, customTopics = [], onUpdateTopic, onDeleteTopic }: GrammarTopicsProps) {
  const allModules = customTopics;

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, module: any } | null>(null);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  let longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent, module: any) => {
    // For touch devices, we need to handle scroll as well so maybe pass preventDefault if needed
    // but better not to break scrolling.
    let x = 0; let y = 0;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }

    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x, y, module });
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user is scrolling
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Close context menu on outside interaction
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [contextMenu]);

  return (
    <div className="w-full pb-24 md:pt-4">
       {allModules.map((module, mIdx) => (
        <div key={module.id} className="mb-10 px-4 md:px-0 max-w-xl mx-auto w-full">
          {/* Module Header */}
          <div 
            className="mb-6 flex items-center justify-between sm:px-4 select-none relative"
            onTouchStart={(e) => handleTouchStart(e, module)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseDown={(e) => handleTouchStart(e, module)}
            onMouseUp={handleTouchEnd}
            onMouseMove={handleTouchMove}
            onMouseLeave={handleTouchEnd}
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
                {module.title}
                {module.permanent && <ShieldCheck size={18} className="text-indigo-500" />}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">{module.description}</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* The vertical timeline line */}
            <div className="absolute top-4 bottom-4 left-[19px] sm:left-[23px] w-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />

            <div className="space-y-3">
              {module.steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active';
                const isLocked = step.status === 'locked';

                let Icon = BookOpen;
                if (isLocked) Icon = Lock;
                if (isCompleted) Icon = Check;
                if (isActive) Icon = Star;

                return (
                    <motion.div 
                    key={step.id}
                    whileHover={!isLocked ? { scale: 1.02, x: 4 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    onClick={() => !isLocked && onViewTopic(step.topicId, step.pageIdx, !!module.grammarData)}
                    className={classNames(
                      "flex items-center gap-4 relative z-10",
                      !isLocked ? "cursor-pointer" : ""
                    )}
                  >
                    {/* Circle Node on Timeline */}
                    <div className={classNames(
                      "w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center border-[3px] border-slate-50 dark:border-[#0f172a] shadow-sm transition-colors",
                      isCompleted ? "bg-emerald-500 text-white border-emerald-100/50 dark:border-emerald-900/50" :
                      isActive ? "bg-indigo-500 text-white shadow-indigo-200 dark:shadow-none border-indigo-100 dark:border-indigo-900/50" :
                      "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    )}>
                      <Icon size={isCompleted ? 20 : 18} strokeWidth={isCompleted ? 3 : 2} />
                    </div>

                    {/* Step Card */}
                    <div className={classNames(
                      "flex-1 p-2.5 sm:p-3 rounded-lg border-2 transition-all",
                      isCompleted ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 shadow-sm" :
                      isActive ? "bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-600 shadow-sm" :
                      "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/50 opacity-80"
                    )}>
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <h3 className={classNames(
                            "text-sm sm:text-base font-black mb-0.5",
                            isLocked ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"
                          )}>
                            {step.title}
                          </h3>
                          <p className={classNames(
                            "text-[10px] sm:text-xs font-bold",
                            isLocked ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
                          )}>
                            {step.subtitle}
                          </p>
                        </div>
                        
                        {!isLocked && (
                          <div className={classNames(
                            "w-6 h-6 shrink-0 rounded-full flex items-center justify-center",
                            isCompleted ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" :
                            "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                          )}>
                            <ArrowRight size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 w-48 overflow-hidden"
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 150), 
              left: Math.min(contextMenu.x, window.innerWidth - 200) 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1 pointer-events-none">
              <p className="text-xs font-bold text-slate-500 truncate">{contextMenu.module.title}</p>
            </div>
            
            {!contextMenu.module.permanent && (
              <>
                <button
                  onClick={() => {
                    if (onUpdateTopic) {
                      onUpdateTopic({ ...contextMenu.module, permanent: true });
                    }
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <ShieldCheck size={16} /> Make Permanent
                </button>
                <button
                  onClick={() => {
                    setEditingModule(contextMenu.module);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <Edit2 size={16} /> Edit Title
                </button>
                <button
                  onClick={() => {
                    if (onDeleteTopic) {
                      onDeleteTopic(contextMenu.module.id);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete Topic
                </button>
              </>
            )}
            {contextMenu.module.permanent && (
               <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">
                 This topic is permanent and cannot be modified.
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingModule && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditingModule(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={() => setEditingModule(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
              
              <h3 className="text-xl font-black mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Edit2 size={20} className="text-indigo-500" />
                Edit Topic
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Title</label>
                  <input 
                    type="text" 
                    value={editingModule.title} 
                    onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Description</label>
                  <input 
                    type="text" 
                    value={editingModule.description} 
                    onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={() => {
                    if (onUpdateTopic) {
                      onUpdateTopic(editingModule);
                    }
                    setEditingModule(null);
                  }}
                  className="w-full mt-4 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl transition-all active:scale-95 text-sm uppercase tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Check size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
