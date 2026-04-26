import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { classNames } from '../lib/utils';

// Grammar explanations styled with a nice reading experience
const GRAMMAR_DATA: Record<number, any> = {
  1: {
    title: "Parts of Speech",
    subtitle: "The building blocks of English",
    content: [
      {
        title: "Nouns (বিশেষ্য)",
        keyPoints: [
          "A noun is a naming word.",
          "It can name a person, place, thing, animal, or idea.",
          "Usually functions as the subject or object."
        ],
        text: "In simple terms, everything we can see, feel, or think about has a name, and that name is a noun.",
        examples: [
          { en: "The dog is barking.", bn: "কুকুরটি ডাকছে। (Noun: dog)" },
          { en: "Dhaka is a big city.", bn: "ঢাকা একটি বড় শহর। (Nouns: Dhaka, city)" }
        ]
      },
      {
        title: "Verbs (ক্রিয়া)",
        keyPoints: [
          "A verb is an action or doing word.",
          "It shows what the subject is doing.",
          "A sentence must have at least one verb."
        ],
        text: "Verbs bring sentences to life by showing action or state of being (like is, am, are).",
        examples: [
          { en: "I eat rice.", bn: "আমি ভাত খাই। (Verb: eat)" },
          { en: "She runs fast.", bn: "সে দ্রুত দৌড়ায়। (Verb: runs)" }
        ]
      },
      {
        title: "Adjectives (বিশেষণ)",
        keyPoints: [
          "An adjective describes a noun or pronoun.",
          "It tells us about the quality, quantity, size, or color.",
          "Usually comes before the noun it describes."
        ],
        text: "Without adjectives, language would be very boring. They add details and color to sentences.",
        examples: [
          { en: "It is a red car.", bn: "এটি একটি লাল গাড়ি। (Adjective: red)" },
          { en: "He is a good boy.", bn: "সে একজন ভালো ছেলে। (Adjective: good)" }
        ]
      }
    ]
  },
  2: {
    title: "Tenses Overview",
    subtitle: "Present, Past, and Future",
    content: [
      {
        title: "Present Tense (বর্তমান কাল)",
        keyPoints: [
          "Used to describe actions happening right now.",
          "Used for habits and general truths."
        ],
        text: "This tense connects us to the current moment. It describes what we do every day or what is happening exactly now.",
        examples: [
          { en: "I eat rice.", bn: "আমি ভাত খাই। (Habit/General)" },
          { en: "The sun rises in the east.", bn: "সূর্য পূর্ব দিকে ওঠে। (Universal truth)" }
        ]
      },
      {
        title: "Past Tense (অতীত কাল)",
        keyPoints: [
          "Used for actions that have already finished.",
          "Usually involves adding '-ed' to verbs, or irregular changes."
        ],
        text: "Whenever we talk about our memories, yesterday, or historical events, we must use the Past Tense.",
        examples: [
          { en: "I ate rice.", bn: "আমি ভাত খেয়েছিলাম। (Finished action)" },
          { en: "He went to school.", bn: "সে স্কুলে গিয়েছিল। (Irregular verb 'went')" }
        ]
      },
      {
        title: "Future Tense (ভবিষ্যৎ কাল)",
        keyPoints: [
          "Used for actions that have not happened yet.",
          "Always uses 'will' or 'shall' before the verb."
        ],
        text: "To talk about our plans, hopes, and events coming tomorrow, we employ the Future Tense.",
        examples: [
          { en: "I will eat rice.", bn: "আমি ভাত খাব। (Plan/Future)" },
          { en: "They will come tomorrow.", bn: "তারা আগামীকাল আসবে। (Future action)" }
        ]
      }
    ]
  },
  3: {
    title: "Articles",
    subtitle: "A, An, The",
    content: [
      {
        title: "Definite Article (The)",
        keyPoints: [
          "Points out a specific person, place, or thing.",
          "Used when the listener knows exactly what you are referring to.",
          "Used for unique things (The Sun, The Moon)."
        ],
        text: "Use 'The' when the object is specific or has been mentioned before.",
        examples: [
          { en: "The book is on the table.", bn: "বইটি টেবিলের ওপর। (Specific book)" },
          { en: "The sun rises in the east.", bn: "সূর্য পূর্ব দিকে ওঠে। (Unique object)" }
        ]
      },
      {
        title: "Indefinite Articles (A, An)",
        keyPoints: [
          "Used before singular, countable nouns.",
          "'A' is used before consonant sounds.",
          "'An' is used before vowel sounds (a, e, i, o, u)."
        ],
        text: "These are used when you are not speaking about any specific object, rather one of many.",
        examples: [
          { en: "I have an apple.", bn: "আমার একটি আপেল আছে। (Vowel sound)" },
          { en: "She is a doctor.", bn: "সে একজন ডাক্তার। (Consonant sound)" }
        ]
      },
      {
        title: "Omissions (No Article)",
        keyPoints: [
          "No article before proper nouns (names of people, cities).",
          "No article before plural nouns speaking in general.",
          "No article before abstract nouns (love, honesty)."
        ],
        text: "Sometimes, we don't need any article at all. This is called the 'zero article' rule.",
        examples: [
          { en: "Milk is good for health.", bn: "দুধ স্বাস্থ্যের জন্য ভালো। (General)" },
          { en: "Dhaka is the capital of Bangladesh.", bn: "ঢাকা বাংলাদেশের রাজধানী। (Proper Noun)" }
        ]
      }
    ]
  },
  4: {
    title: "Prepositions",
    subtitle: "Linking words showing relationships",
    content: [
      {
        title: "Prepositions of Time (সময়)",
        keyPoints: [
          "'in' for months, years, and long periods.",
          "'on' for specific days and dates.",
          "'at' for specific times of the day."
        ],
        text: "These small words tell us exactly *when* something occurs. The rule is general (in) to specific (at).",
        examples: [
          { en: "I was born in 1990.", bn: "আমি ১৯৯০ সালে জন্মেছিলাম। (Year: in)" },
          { en: "See you on Monday.", bn: "সোমবার দেখা হবে। (Day: on)" },
          { en: "The class starts at 5 PM.", bn: "ক্লাসটি বিকাল ৫ টায় শুরু হবে। (Specific Time: at)" }
        ]
      },
      {
        title: "Prepositions of Place (স্থান)",
        keyPoints: [
          "'in' for enclosed spaces (cities, countries).",
          "'on' for flat surfaces.",
          "'at' for a specific point or address."
        ],
        text: "Place prepositions follow a similar pattern to time: from large areas (in) to finding an exact location (at).",
        examples: [
          { en: "He lives in London.", bn: "সে লন্ডনে থাকে। (City: in)" },
          { en: "The book is on the desk.", bn: "বইটি ডেস্কের ওপর। (Surface: on)" },
          { en: "I am waiting at the bus stop.", bn: "আমি বাস স্টপে অপেক্ষা করছি। (Point: at)" }
        ]
      },
      {
        title: "Prepositions of Direction (দিক)",
        keyPoints: [
          "'to' shows movement toward a destination.",
          "'into' shows movement entering something.",
          "'towards' means in the general direction of."
        ],
        text: "Direction prepositions are all about movement and bringing the subject from point A to point B.",
        examples: [
          { en: "She went to school.", bn: "সে স্কুলে গেল। (Destination: to)" },
          { en: "He jumped into the water.", bn: "সে পানিতে ঝাঁপ দিল। (Entering: into)" }
        ]
      }
    ]
  },
  5: {
    title: "Sentence Details",
    subtitle: "Building blocks of longer thoughts",
    content: [
      {
        title: "Simple Sentences (সরল বাক্য)",
        keyPoints: [
          "Contains only one independent clause.",
          "Expresses a single complete thought.",
          "Has one subject and one verb."
        ],
        text: "A simple sentence is clear and direct. It doesn't mean it's short, but it only contains one main idea.",
        examples: [
          { en: "She drinks coffee.", bn: "সে কফি পান করে।" },
          { en: "They are playing football in the field.", bn: "তারা মাঠে ফুটবল খেলছে।" }
        ]
      },
      {
        title: "Compound Sentences (যৌগিক বাক্য)",
        keyPoints: [
          "Two simple sentences joined together.",
          "Joined by FANBOYS (For, And, Nor, But, Or, Yet, So)."
        ],
        text: "When you want to balance two equally important ideas, you connect them into a compound sentence.",
        examples: [
          { en: "I like tea, and he likes coffee.", bn: "আমি চা পছন্দ করি, এবং সে কফি পছন্দ করে।" },
          { en: "She was tired, but she kept working.", bn: "সে ক্লান্ত ছিল, কিন্তু সে কাজ চালিয়ে গেল।" }
        ]
      },
      {
        title: "Complex Sentences (জটিল বাক্য)",
        keyPoints: [
          "One independent clause + one or more dependent clauses.",
          "Uses connectors like because, if, although, when."
        ],
        text: "A complex sentence combines a strong standalone sentence with a weaker dependent sentence that adds detail.",
        examples: [
          { en: "Because it was raining, we stayed home.", bn: "যেহেতু বৃষ্টি হচ্ছিল, আমরা বাড়িতেই ছিলাম।" },
          { en: "I will call you when I arrive.", bn: "আমি পৌঁছানোর পর তোমাকে কল করব।" }
        ]
      }
    ]
  },
  6: {
    title: "Active & Passive",
    subtitle: "Who is doing the action?",
    content: [
      {
        title: "Active Voice (সক্রিয় বাচ্য)",
        keyPoints: [
          "The subject performs the action.",
          "The focus is on the *doer*.",
          "Structure: Subject + Verb + Object."
        ],
        text: "In active voice, the sentence starts with the person or thing doing the action. It's direct and easy to read.",
        examples: [
          { en: "The cat ate the fish.", bn: "বিড়ালটি মাছ খেল। (Subject 'cat' is acting)" },
          { en: "Rahim writes a letter.", bn: "রহিম একটি চিঠি লেখে।" }
        ]
      },
      {
        title: "Passive Voice (কর্মবাচ্য)",
        keyPoints: [
          "The subject receives the action.",
          "The focus is on the *action* or the *object*.",
          "Structure: Object + 'to be' Verb + Past Participle (V3) + by + Subject."
        ],
        text: "Use the passive voice when you don't know who did the action, or when the action itself is more important than who did it.",
        examples: [
          { en: "The fish was eaten by the cat.", bn: "মাছটি বিড়ালের দ্বারা খাওয়া হলো।" },
          { en: "The letter is written by Rahim.", bn: "চিঠিটি রহিমের দ্বারা লেখা হলো।" }
        ]
      }
    ]
  },
  7: {
    title: "Present Continuous",
    subtitle: "Actions happening right now",
    content: [
      {
        title: "Usage (ব্যবহার)",
        keyPoints: [
          "Used for actions happening exactly at the time of speaking.",
          "Used for temporary situations happening around now."
        ],
        text: "If you can add 'right now' or 'currently' to the sentence, it's usually Present Continuous.",
        examples: [
          { en: "I am writing a letter.", bn: "আমি একটি চিঠি লিখছি। (Right now)" },
          { en: "She is staying with her friend.", bn: "সে তার বন্ধুর সাথে থাকছে। (Temporary)" }
        ]
      },
      {
        title: "Structure (গঠন)",
        keyPoints: [
          "Subject + am/is/are + Verb with 'ing'.",
          "'am' goes with I.",
          "'is' goes with He/She/It (singular).",
          "'are' goes with You/We/They (plural)."
        ],
        text: "The 'ing' suffix shows that the action has started but has not yet finished.",
        examples: [
          { en: "He is running in the field.", bn: "সে মাঠে দৌড়াচ্ছে।" },
          { en: "They are talking loudly.", bn: "তারা জোরে কথা বলছে।" }
        ]
      },
      {
        title: "Examples in Action",
        keyPoints: [
          "Negative sentences: Add 'not' after am/is/are.",
          "Questions: Move am/is/are to the front."
        ],
        text: "Let's see how present continuous forms both negative statements and questions.",
        examples: [
          { en: "I am not sleeping.", bn: "আমি ঘুমাচ্ছি না। (Negative)" },
          { en: "Are you listening?", bn: "তুমি কি শুনছো? (Question)" }
        ]
      }
    ]
  },
  8: {
    title: "Past Perfect",
    subtitle: "The past before the past",
    content: [
      {
        title: "Usage (ব্যবহার)",
        keyPoints: [
          "Used to show that one action happened BEFORE another action in the past.",
          "Helps order past events clearly."
        ],
        text: "Imagine two things happened yesterday. The thing that happened *first* gets the Past Perfect tense.",
        examples: [
          { en: "The train had left before I reached the station.", bn: "আমি স্টেশনে পৌঁছানোর আগেই ট্রেনটি ছেড়ে গিয়েছিল।" },
          { en: "She had finished work when the boss called.", bn: "বস কল করার আগে সে কাজ শেষ করেছিল।" }
        ]
      },
      {
        title: "Structure (গঠন)",
        keyPoints: [
          "Subject + had + Past Participle (V3).",
          "Usually used alongside Past Simple (the second action)."
        ],
        text: "Unlike other tenses, Past Perfect is incredibly easy to form because 'had' goes with all subjects (I, He, They).",
        examples: [
          { en: "We had eaten dinner.", bn: "আমরা রাতের খাবার খেয়েছিলাম।" },
          { en: "They had gone home early.", bn: "তারা তাড়াতাড়ি বাড়ি চলে গিয়েছিল।" }
        ]
      },
      {
        title: "More Examples",
        keyPoints: [
          "Often links with words like 'before', 'after', or 'already'."
        ],
        text: "You'll almost always see connecting words separating the Past Perfect event from the Past Simple event.",
        examples: [
          { en: "After he had finished, he went to sleep.", bn: "কাজ শেষ করার পর, সে ঘুমাতে গেল।" },
          { en: "I already had eaten.", bn: "আমি আগেই খেয়ে নিয়েছিলাম।" }
        ]
      }
    ]
  }
};

interface GrammarExplanationProps {
  key?: string;
  topicId: number;
  initialPage?: number;
  isCustom?: boolean;
  customData?: any;
  onClose: () => void;
  onStartPractice: (topicId: number) => void;
}

export function GrammarExplanation({ topicId, initialPage = 0, isCustom, customData, onClose, onStartPractice }: GrammarExplanationProps) {
  const data = isCustom && customData ? customData : (GRAMMAR_DATA[topicId] || {
    title: "Coming Soon",
    subtitle: "We are currently writing this lesson.",
    content: []
  });

  const pages = data.content;
  const [currentPage, setCurrentPage] = useState(initialPage);
  // Optional safety if initialPage is out of bounds
  useEffect(() => {
    if (initialPage >= pages.length && pages.length > 0) {
      setCurrentPage(0);
    }
  }, [initialPage, pages.length]);

  const currentContent = pages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pages.length - 1;

  const handleNext = () => {
    if (!isLastPage) setCurrentPage(p => p + 1);
  };
  const handlePrev = () => {
    if (!isFirstPage) setCurrentPage(p => p - 1);
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-50 flex flex-col md:p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 px-5 md:max-w-2xl md:mx-auto w-full pt-6 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 rounded-t-3xl md:rounded-2xl shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 -ml-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0">
            <X size={20} className="text-slate-600 dark:text-slate-300" strokeWidth={3} />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{data.title}</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{data.subtitle}</p>
          </div>
        </div>
        
        {/* Page progress indicator */}
        {pages.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 font-bold text-slate-400 dark:text-slate-500 text-xs">
            <BookOpen size={14} />
            <span>{currentPage + 1} / {pages.length}</span>
          </div>
        )}
      </div>

      {/* Pages Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full md:max-w-2xl md:mx-auto pb-24">
        <div className="p-3 sm:p-4 w-full">
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
               <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 rotate-6 shadow-inner">
                   <span className="text-4xl">📝</span>
               </div>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Notes are being added</h3>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* Book Page Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                  {/* Topic Title */}
                  <div className="inline-flex items-center justify-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
                    Part {currentPage + 1}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 leading-tight">
                    {currentContent.title}
                  </h3>
                  
                  {/* Key Points Banner */}
                  {currentContent.keyPoints && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-xl p-4 mb-6">
                      <h4 className="font-black text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
                        <Check size={14} strokeWidth={4} />
                        Key Points
                      </h4>
                      <ul className="space-y-1.5">
                        {currentContent.keyPoints.map((point: string, i: number) => (
                          <li key={i} className="text-amber-900/80 dark:text-amber-200/70 font-bold text-xs sm:text-sm flex gap-2">
                            <span className="text-amber-400 shrink-0">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed font-bold">
                    {currentContent.text}
                  </p>
                  
                  {/* Examples Section */}
                  {currentContent.examples && currentContent.examples.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Examples</h4>
                      <div className="space-y-2">
                        {currentContent.examples.map((ex: any, eIdx: number) => (
                          <div key={eIdx} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 sm:p-4 border-2 border-slate-100 dark:border-slate-800/80">
                            <p className="font-black text-slate-800 dark:text-slate-100 text-sm mb-0.5">{ex.en}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">{ex.bn}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentContent.sourcePage && (
                    <div className="mt-8 pt-4 border-t-2 border-slate-100 dark:border-slate-800 text-right">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Source: {currentContent.sourcePage}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Floating Action Bar / Page Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 z-20">
        <div className="md:max-w-2xl mx-auto w-full flex items-center justify-between gap-3">
          
          {pages.length > 0 && (
            <>
              {/* Prev Button */}
              <button 
                onClick={handlePrev}
                disabled={isFirstPage}
                className={classNames(
                  "flex items-center justify-center p-2.5 sm:px-5 rounded-xl font-black transition-all shrink-0 uppercase text-[10px] tracking-widest",
                  isFirstPage 
                    ? "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 opacity-50 cursor-not-allowed" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-95 shadow-sm"
                )}
              >
                <ArrowLeft size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Mobile progress indicator */}
              <div className="sm:hidden font-black text-slate-400 dark:text-slate-500 text-[10px] tracking-widest uppercase">
                {currentPage + 1} / {pages.length}
              </div>

              {/* Next / Finish Button */}
              {!isLastPage ? (
                <button 
                  onClick={handleNext}
                  className="flex-1 sm:flex-none flex items-center justify-center bg-indigo-500 text-white hover:bg-indigo-600 p-2.5 sm:px-6 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-indigo-500/20 uppercase text-[10px] tracking-widest"
                >
                  <span className="mr-1.5">Next Page</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => onStartPractice(topicId)}
                  className="flex-1 sm:flex-none flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 sm:px-6 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-emerald-500/20 uppercase text-[10px] tracking-widest"
                >
                  <span className="mr-1.5">Practice Now</span>
                  <Check size={16} strokeWidth={4} />
                </button>
              )}
            </>
          )}

          {pages.length === 0 && (
            <button 
               onClick={onClose}
               className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-2xl font-bold"
             >
               Go Back
             </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
