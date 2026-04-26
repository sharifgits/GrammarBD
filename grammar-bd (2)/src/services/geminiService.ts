import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateGrammarLesson(content: string) {
  const prompt = `
    Analyze the following English learning content and extract/create a structured grammar lesson.
    The primary audience are Bangladeshi learners, so please provide clear, comprehensive explanations in Bengali (বাংলা) alongside English examples.
    DO NOT use markdown asterisks (* or **) or any star symbols in the text. Format the text nicely with clear paragraphs or numbers instead.
    
    Return a JSON object with this exact structure:
    {
      "title": "Lesson Title (English & Bengali)",
      "description": "Brief overview in Bengali",
      "subtopics": [
        {
          "title": "Subtopic Name",
          "keyPoints": ["Important point 1 in Bengali", "Important point 2 in Bengali"],
          "content": "Detailed explanation in Bengali and English. No asterisks. Use clean spacing or numbers.",
          "examples": [
            {
              "en": "English example sentence",
              "bn": "Bengali translation"
            }
          ],
          "sourcePage": "String, like 'পৃষ্ঠা: ৫' or 'পৃষ্ঠা: ৫-৬'. Identify from the [Page X] tags in the text. If none, leave empty string."
        }
      ],
      "quiz": [
        {
          "question": "The quiz question in English",
          "options": ["A", "B", "C", "D"],
          "answer": "The correct option text"
        }
      ]
    }
    
    Content to analyze:
    ${content}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
