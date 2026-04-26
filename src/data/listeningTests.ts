export interface Question {
  id: number;
  type: 'fill' | 'multiple' | 'matching' | 'map';
  text: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
}

export interface Section {
  id: number;
  title: string;
  range: string; // e.g. "Questions 1-10"
  instructions: string;
  questions: Question[];
}

export interface ListeningTest {
  id: number;
  book: number;
  testNumber: number;
  audioUrl: string;
  duration: string;
  sections: Section[];
}

export const LISTENING_TESTS: ListeningTest[] = [
  {
    id: 1,
    book: 10,
    testNumber: 1,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "31:45",
    sections: [
      {
        id: 1,
        title: "Section 1",
        range: "Questions 1-10",
        instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        questions: [
          { id: 1, type: 'fill', text: "Name: Global ______", correctAnswer: "Recruiting" },
          { id: 2, type: 'fill', text: "Position applied for: ______", correctAnswer: "Clerk" },
          { id: 3, type: 'fill', text: "Date of birth: ______", correctAnswer: "1994" },
          { id: 4, type: 'fill', text: "Availability: ______", correctAnswer: "Monday" }
        ]
      },
      {
        id: 2,
        title: "Section 2",
        range: "Questions 11-20",
        instructions: "Choose the correct letter, A, B or C.",
        questions: [
          { 
            id: 11, 
            type: 'multiple', 
            text: "What is the main reason for the meeting?", 
            options: ["A. To announce a budget cut", "B. To introduce new staff", "C. To discuss the summer festival"],
            correctAnswer: "C"
          },
          { 
            id: 12, 
            type: 'multiple', 
            text: "Who is responsible for the marketing?", 
            options: ["A. Mr. Thomson", "B. Sarah Jenkins", "C. The local council"],
            correctAnswer: "B"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    book: 11,
    testNumber: 1,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "30:20",
    sections: [
      {
        id: 1,
        title: "Section 1",
        range: "Questions 1-10",
        instructions: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
        questions: [
          { id: 1, type: 'fill', text: "Hire period: ______", correctAnswer: "Two weeks" },
          { id: 2, type: 'fill', text: "Car type: ______", correctAnswer: "Economy" },
          { id: 3, type: 'fill', text: "Insurance included: ______", correctAnswer: "Yes" }
        ]
      }
    ]
  },
  {
    id: 3,
    book: 12,
    testNumber: 1,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "32:10",
    sections: [
      {
        id: 1,
        title: "Section 1",
        range: "Questions 1-10",
        instructions: "Complete the notes below. Write ONE WORD ONLY.",
        questions: [
          { id: 1, type: 'fill', text: "Family name: ______", correctAnswer: "Pritchard" },
          { id: 2, type: 'fill', text: "Postcode: ______", correctAnswer: "BS8 2PH" }
        ]
      }
    ]
  }
];

// Helper to get tests for a specific book
export const getTestsForBook = (bookNumber: number) => {
  // Normally this would filter the real array
  // For demo, we return the demo test if book is 10, otherwise skeletons
  if (bookNumber === 10) return LISTENING_TESTS;
  
  return [
    { id: bookNumber * 10 + 1, book: bookNumber, testNumber: 1, audioUrl: "", duration: "30:00", sections: [] },
    { id: bookNumber * 10 + 2, book: bookNumber, testNumber: 2, audioUrl: "", duration: "30:00", sections: [] },
    { id: bookNumber * 10 + 3, book: bookNumber, testNumber: 3, audioUrl: "", duration: "30:00", sections: [] },
    { id: bookNumber * 10 + 4, book: bookNumber, testNumber: 4, audioUrl: "", duration: "30:00", sections: [] },
  ];
};
