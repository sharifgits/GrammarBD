import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookmarkPlus, BookmarkCheck, Search, RefreshCw, Bookmark, Trash2, Library } from 'lucide-react';
import { classNames } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

interface VocabWord {
  word: string;
  meaning: string;
  synonyms: string[];
  sentence?: string;
  sentenceMeaning?: string;
}

interface VocabStory {
  id: string;
  title: string;
  story: string;
  vocabulary: {
    word: string;
    pronunciation: string;
    meaning: string;
  }[];
}

interface VocabViewProps {
  onSearchSynonym: (word: string) => void;
}

export function VocabView({ onSearchSynonym }: VocabViewProps) {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentStory, setCurrentStory] = useState<VocabStory | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Saved words and stories
  const [savedWords, setSavedWords] = useState<VocabWord[]>([]);
  const [savedStories, setSavedStories] = useState<VocabStory[]>([]);
  
  const [viewMode, setViewMode] = useState<'discover' | 'story' | 'saved'>('discover');
  const [savedSubTab, setSavedSubTab] = useState<'words' | 'stories'>('words');
  const [searchCache, setSearchCache] = useState<Record<string, VocabWord[]>>({});
  
  // Pooling for instant experience
  const [wordPool, setWordPool] = useState<VocabWord[]>([]);
  const [storyPool, setStoryPool] = useState<VocabStory[]>([]);
  const [isPreFetching, setIsPreFetching] = useState(false);

  // Flag to ensure we only load initially once
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  
  useEffect(() => {
    const savedW = localStorage.getItem('vocab_saved_words_v2');
    if (savedW) {
      try { setSavedWords(JSON.parse(savedW)); } catch (e) { }
    }
    const savedS = localStorage.getItem('vocab_saved_stories_v1');
    if (savedS) {
      try { setSavedStories(JSON.parse(savedS)); } catch (e) { }
    }
  }, []);

  // Pre-fetch pool on startup
  useEffect(() => {
    if (!hasStartedLoading) {
      setHasStartedLoading(true);
      refillPools();
    }
  }, [hasStartedLoading]);

  const getAI = () => {
    const customKey = localStorage.getItem('GEMINI_API_KEY');
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is not configured. Please set it in Settings.");
    }
    return new GoogleGenAI({ apiKey });
  };

  const refillPools = async () => {
    if (isPreFetching) return;
    setIsPreFetching(true);
    
    try {
      const ai = getAI();
      
      // Fetch some words if pool is low
      if (wordPool.length < 5) {
        const wordPrompt = `Pool 20 random English vocab words (intermediate/advanced). 
Return JSON array with objects: word, meaning(Bengali), synonyms(5), sentence(English), sentenceMeaning(Bengali).`;
        const wordResp = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: wordPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sentence: { type: Type.STRING },
                  sentenceMeaning: { type: Type.STRING }
                },
                required: ["word", "meaning", "synonyms", "sentence", "sentenceMeaning"]
              }
            }
          }
        });
        const wordsData = JSON.parse(wordResp.text || "[]");
        setWordPool(prev => [...prev, ...wordsData]);
        
        // If we have no words showing, show some immediately
        if (words.length === 0 && wordsData.length > 0) {
          setWords(wordsData.slice(0, 10));
          setWordPool(wordsData.slice(10));
        }
      }

      // Fetch a story if pool is low
      if (storyPool.length < 2) {
        const storyPrompt = `Bengali story (4 sentences) + 8 English vocab embedded. Title Bengali. 
Extract vocab: word, pronunciation(Bengali), meaning(Bengali). JSON.`;
        const storyResp = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: storyPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                story: { type: Type.STRING },
                vocabulary: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      pronunciation: { type: Type.STRING },
                      meaning: { type: Type.STRING }
                    },
                    required: ["word", "pronunciation", "meaning"]
                  }
                }
              },
              required: ["title", "story", "vocabulary"]
            }
          }
        });
        const storyData = JSON.parse(storyResp.text || "{}");
        storyData.id = crypto.randomUUID();
        setStoryPool(prev => [...prev, storyData]);
        
        if (!currentStory) {
          setCurrentStory(storyData);
        }
      }
    } catch (e) {
      console.error("Pool refill failed:", e);
    } finally {
      setIsPreFetching(false);
    }
  };

  const generateWords = async () => {
    setError(null);
    setSearchQuery('');
    
    if (wordPool.length >= 10) {
      const nextBatch = wordPool.slice(0, 10);
      setWords(nextBatch);
      setWordPool(prev => prev.slice(10));
      // Non-blocking refill
      if (wordPool.length < 15) refillPools();
      return;
    }

    setLoading(true);
    try {
      const ai = getAI();
      const prompt = `Generate 10 random English vocab words. 
JSON: word, meaning(Bengali), synonyms(5), sentence(English), sentenceMeaning(Bengali).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                sentence: { type: Type.STRING },
                sentenceMeaning: { type: Type.STRING }
              },
              required: ["word", "meaning", "synonyms", "sentence", "sentenceMeaning"]
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || "[]");
      setWords(data);
      refillPools(); // Refill other items
    } catch (err: any) {
      setError(err.message || 'Failed to generate words.');
    } finally {
      setLoading(false);
    }
  };

  const generateStory = async () => {
    setError(null);
    setViewMode('story');
    
    if (storyPool.length > 0) {
      const nextStory = storyPool[0];
      setCurrentStory(nextStory);
      setStoryPool(prev => prev.slice(1));
      // Non-blocking refill
      if (storyPool.length < 2) refillPools();
      return;
    }

    setLoading(true);
    try {
      const ai = getAI();
      const prompt = `Bengali story (4 sentences) + 8 English vocab embedded. Title Bengali. 
Extract vocab: word, pronunciation(Bengali), meaning(Bengali). JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              story: { type: Type.STRING },
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    pronunciation: { type: Type.STRING },
                    meaning: { type: Type.STRING }
                  },
                  required: ["word", "pronunciation", "meaning"]
                }
              }
            },
            required: ["title", "story", "vocabulary"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}");
      data.id = crypto.randomUUID();
      setCurrentStory(data);
      refillPools();
    } catch (err: any) {
      setError(err.message || 'Failed to generate story.');
    } finally {
      setLoading(false);
    }
  };

  const searchWordDirect = async (query: string) => {
    const q = query.trim().toLowerCase();
    if (searchCache[q]) {
      setWords(searchCache[q]);
      setViewMode('discover');
      setSearchQuery(query);
      return;
    }

    setViewMode('discover');
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    try {
      const ai = getAI();
      const prompt = `Details for: "${q}". 
Provide exactly one English vocab word matching.
JSON format:
- word: English
- meaning: Bengali
- synonyms: [5 English]
- sentence: English
- sentenceMeaning: Bengali

Return JSON array with one object.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                sentence: { type: Type.STRING },
                sentenceMeaning: { type: Type.STRING }
              },
              required: ["word", "meaning", "synonyms", "sentence", "sentenceMeaning"]
            }
          }
        }
      });
      
      const responseText = response.text || "[]";
      let data: VocabWord[] = [];
      try { data = JSON.parse(responseText); } catch (err) { throw new Error("Invalid format received from AI."); }
      
      if (data.length > 0) {
        setWords(data);
        setSearchCache(prev => ({ ...prev, [q]: data }));
      } else {
        setError("No word found for your search.");
      }
    } catch (err: any) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const searchWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchWordDirect(searchQuery);
  };

  const handleSaveWord = (wordObj: VocabWord) => {
    const isSaved = savedWords.some(s => s.word.toLowerCase() === wordObj.word.toLowerCase());
    if (!isSaved) {
      const updatedSaved = [...savedWords, wordObj];
      setSavedWords(updatedSaved);
      localStorage.setItem('vocab_saved_words_v2', JSON.stringify(updatedSaved));
    }
    setWords(words.filter(w => w.word.toLowerCase() !== wordObj.word.toLowerCase()));
  };
  
  const handleRemoveSavedWord = (wordStr: string) => {
      const updatedSaved = savedWords.filter(s => s.word.toLowerCase() !== wordStr.toLowerCase());
      setSavedWords(updatedSaved);
      localStorage.setItem('vocab_saved_words_v2', JSON.stringify(updatedSaved));
  };

  const handleSaveStory = (storyObj: VocabStory) => {
    const isSaved = savedStories.some(s => s.id === storyObj.id);
    if (!isSaved) {
      const updatedSaved = [...savedStories, storyObj];
      setSavedStories(updatedSaved);
      localStorage.setItem('vocab_saved_stories_v1', JSON.stringify(updatedSaved));
      // Feedback to user
      setSavedSubTab('stories');
    }
  };

  const handleRemoveSavedStory = (id: string) => {
      const updatedSaved = savedStories.filter(s => s.id !== id);
      setSavedStories(updatedSaved);
      localStorage.setItem('vocab_saved_stories_v1', JSON.stringify(updatedSaved));
  };

  // Highlighting English words in the story
  const renderStoryText = (text: string, vocabList: {word:string}[]) => {
    const wordsInStory = text.split(/(\s+)/);
    const vocabLower = vocabList.map(v => v.word.toLowerCase());
    
    return wordsInStory.map((wordObj, i) => {
        // Strip punctuation for matching
        const cleanWord = wordObj.replace(/[,.!?;:]/g, '').toLowerCase();
        if (vocabLower.includes(cleanWord)) {
            return <span key={i} className="text-rose-600 dark:text-rose-400 font-bold">{wordObj}</span>;
        }
        return <span key={i}>{wordObj}</span>;
    });
  };

  const renderWordCard = (item: VocabWord, isSaved: boolean) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      key={item.word}
      className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 capitalize">{item.word}</h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.meaning}</p>
            {item.sentence && (
              <div className="mt-2 mb-2 border-l-4 border-indigo-200 dark:border-indigo-800 pl-3 py-0.5">
                <p className="text-slate-600 dark:text-slate-300 italic text-xs sm:text-sm font-bold">
                  "{item.sentence}"
                </p>
                {item.sentenceMeaning && (
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px] sm:text-xs mt-0.5">
                    {item.sentenceMeaning}
                  </p>
                )}
              </div>
            )}
          </div>
          {!isSaved ? (
            <button 
                onClick={() => handleSaveWord(item)}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700"
                title="Save word"
            >
                <BookmarkPlus size={14} className="sm:mr-1" />
                <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Save</span>
            </button>
          ) : (
             <button 
                onClick={() => handleRemoveSavedWord(item.word)}
                className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-all shrink-0"
                title="Remove saved word"
            >
                <Trash2 size={14} />
            </button> 
          )}
        </div>
        
        <div className="mb-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Synonyms</span>
          <div className="flex flex-wrap gap-1.5 text-left">
            {item.synonyms.map((syn, sIdx) => (
              <button
                key={sIdx}
                onClick={() => { searchWordDirect(syn); }}
                className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider"
                title="Search this synonym"
              >
                {syn.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStoryCard = (story: VocabStory, isSaved: boolean) => (
      <div key={story.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg md:text-xl font-black text-rose-600 dark:text-rose-400 text-center w-full uppercase tracking-tight">{story.title}</h3>
            {isSaved && (
                <button onClick={() => handleRemoveSavedStory(story.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                    <Trash2 size={16} />
                </button>
            )}
        </div>
        
        <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed mb-6 border-b-2 border-slate-50 dark:border-slate-800/50 pb-6 font-bold">
            {renderStoryText(story.story, story.vocabulary)}
        </p>

        <h4 className="font-black text-rose-600 dark:text-rose-400 mb-3 text-[11px] uppercase tracking-widest">শব্দার্থ তালিকা:</h4>
        <div className="space-y-2">
            {story.vocabulary.map((v, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-base">{v.word}</span>
                    <span className="text-slate-400 text-[10px] font-bold">({v.pronunciation})</span>
                    <span className="hidden sm:inline text-slate-400">-</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{v.meaning}</span>
                </div>
            ))}
        </div>
        
        {!isSaved && (
            <div className="mt-6 pt-4 border-t-2 border-slate-50 dark:border-slate-800/50 flex justify-end">
                 <button 
                    onClick={() => handleSaveStory(story)}
                    disabled={savedStories.some(s => s.id === story.id)}
                    className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed font-black rounded-lg transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-md shadow-rose-500/20 active:scale-95"
                >
                    <BookmarkPlus size={14} />
                    {savedStories.some(s => s.id === story.id) ? "Saved" : "Save Story"}
                </button>
            </div>
        )}
      </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 pb-16">
      
      {/* Header Tabs Section */}
      <div className="bg-indigo-500 sm:rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-sm mx-0 sm:mx-4 md:mx-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-8 -translate-y-6" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-1">
            <div className="w-full md:w-auto text-left">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-0.5">Vocabulary</h2>
                <p className="text-indigo-100 font-bold text-xs">Learn words personally or through AI stories.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                <button
                    onClick={() => setViewMode('discover')}
                    className={classNames(
                        "flex-1 md:flex-none px-3 py-1.5 font-black rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest",
                        viewMode === 'discover' ? "bg-white text-indigo-600 shadow-sm" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                >
                    <Search size={14} />
                    <span>Discover</span>
                </button>
                <button
                    onClick={() => {
                        if (!currentStory && viewMode !== 'story') {
                            generateStory();
                        } else {
                            setViewMode('story');
                        }
                    }}
                    className={classNames(
                        "flex-1 md:flex-none px-3 py-1.5 font-black rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest",
                        viewMode === 'story' ? "bg-white text-rose-500 shadow-sm" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                >
                    <Library size={14} />
                    <span>Story</span>
                </button>
                <button
                    onClick={() => setViewMode('saved')}
                    className={classNames(
                        "flex-1 md:flex-none px-3 py-1.5 font-black rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest",
                        viewMode === 'saved' ? "bg-white text-sky-500 shadow-sm" : "bg-white/20 text-white hover:bg-white/30"
                    )}
                >
                    <Bookmark size={14} />
                    <span>Saved ({savedWords.length + savedStories.length})</span>
                </button>
            </div>
        </div>

        {/* Search Bar only visible in Discover */}
        {viewMode === 'discover' && (
            <div className="relative z-10 mt-3 pt-3 border-t border-indigo-400/20">
                <form onSubmit={searchWord} className="flex gap-2 relative">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type a word..."
                            className="w-full h-full pl-4 pr-10 py-2 rounded-xl text-slate-800 placeholder-slate-400 font-bold text-sm outline-none focus:ring-4 focus:ring-white/20 shadow-md bg-white/95"
                        />
                        {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={18} className="animate-spin text-indigo-500" />
                            </div>
                        )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading || !searchQuery.trim()}
                      className="bg-indigo-600 text-white sm:bg-white sm:text-indigo-600 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        <Search size={16} strokeWidth={3} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </form>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-0 min-h-[300px]">
          <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {viewMode === 'discover' && 'Explore'}
                  {viewMode === 'story' && 'AI Story'}
                  {viewMode === 'saved' && 'Collections'}
              </h3>
              
              {/* Contextual Refresh Buttons */}
              {viewMode === 'discover' && (
                  <button onClick={generateWords} disabled={loading} title="Random Words" 
                    className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-black py-1.5 px-4 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest disabled:opacity-70 flex items-center gap-2">
                      <RefreshCw size={14} className={classNames(loading && "animate-spin")} strokeWidth={4} />
                      <span className="hidden sm:inline">Refresh</span>
                  </button>
              )}
              {viewMode === 'story' && !loading && (
                  <button onClick={generateStory} title="New Story"
                     className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 font-black py-1.5 px-4 rounded-xl transition-all shadow-sm text-[10px] uppercase tracking-widest flex items-center gap-2">
                       <RefreshCw size={14} strokeWidth={4} />
                       <span className="hidden sm:inline">New Story</span>
                  </button>
              )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-200 mb-4 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
             <div className="w-full flex flex-col items-center justify-center py-24 text-indigo-500">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="font-medium text-slate-500 animate-pulse">
                    {viewMode === 'story' ? 'Writing a new story...' : 'AI is generating...'}
                </p>
             </div>
          ) : viewMode === 'discover' ? (
              words.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {words.map((item) => renderWordCard(item, false))}
                    </AnimatePresence>
                  </div>
              ) : (
                  <div className="w-full flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <Search size={28} />
                    </div>
                    <p className="text-slate-500 font-medium">No words available right now.</p>
                  </div>
              )
          ) : viewMode === 'story' ? (
              currentStory ? (
                  renderStoryCard(currentStory, false)
              ) : (
                  <div className="flex justify-center p-12"><p className="text-slate-500">No story found.</p></div>
              )
          ) : (
              // Saved view
              <div>
                  <div className="flex gap-2 mb-6 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
                      <button 
                        onClick={() => setSavedSubTab('words')}
                        className={classNames("px-4 py-2 font-bold rounded-lg transition-colors", savedSubTab === 'words' ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}
                      >
                          Words ({savedWords.length})
                      </button>
                      <button 
                        onClick={() => setSavedSubTab('stories')}
                         className={classNames("px-4 py-2 font-bold rounded-lg transition-colors", savedSubTab === 'stories' ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800")}
                      >
                          Stories ({savedStories.length})
                      </button>
                  </div>

                  {savedSubTab === 'words' && (
                      savedWords.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence>
                              {savedWords.map((item) => renderWordCard(item, true))}
                            </AnimatePresence>
                          </div>
                      ) : (
                          <div className="w-full flex justify-center py-12"><p className="text-slate-500 font-medium">No saved words.</p></div>
                      )
                  )}

                  {savedSubTab === 'stories' && (
                      savedStories.length > 0 ? (
                          <div className="space-y-6">
                              {savedStories.map(s => renderStoryCard(s, true))}
                          </div>
                      ) : (
                           <div className="w-full flex justify-center py-12"><p className="text-slate-500 font-medium">No saved stories.</p></div>
                      )
                  )}
              </div>
          )}
      </div>
    </div>
  );
}