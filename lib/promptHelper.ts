
import { QuizConfig } from '../types';
import { LANGUAGES } from '../constants';

export const generateQuizPrompt = (config: QuizConfig, languageCode: string): string => {
  const { level, subjects, questionCount, format } = config;

  const subjectList = subjects.join(', ');
  const languageName = LANGUAGES.find(lang => lang.code === languageCode)?.name || 'English';

  const prompt = `
    You are an expert quiz generator fluent in multiple languages. Create a quiz based on these rules:

    **Configuration:**
    - Level: ${level}
    - Subjects: ${subjectList}
    - Question Count: ${questionCount}
    - Format: ${format}
    - Language: Generate the entire quiz (questions, options, answers, explanations) in the following language: ${languageName}.

    **Output Format:**
    - Your entire response MUST be ONLY a valid JSON array of question objects.
    - Do NOT use markdown fences (\`\`\`json) or any text outside the JSON array.

    **Strict JSON Rules:**
    - The final output MUST be a single, valid JSON array.
    - Ensure all strings inside the JSON are properly escaped (e.g., use \\" for quotes within strings).
    - CRITICAL: Every object in the array MUST be separated by a comma. Do not forget the comma between question objects. Example: [ { ... }, { ... } ]

    **JSON Object Structure:**
    Each object in the array must have the following fields: "question", "type", "answer", "explanation".
    If "type" is "multiple-choice", it MUST also include an "options" field with exactly 4 strings.
    If "type" is "typed-answer", it MUST NOT include an "options" field.
    The "answer" field must exactly match one of the "options" for multiple-choice, or be the expected typed-in string, in the specified language (${languageName}).

    **Example for "multiple-choice" (if language was Spanish):**
    {
      "question": "¿Cuál es la capital de Francia?",
      "type": "multiple-choice",
      "options": ["Londres", "Berlín", "París", "Madrid"],
      "answer": "París",
      "explanation": "París es la capital y la ciudad más poblada de Francia."
    }

    **Example for "typed-answer" (if language was Spanish):**
    {
      "question": "¿Qué elemento tiene el número atómico 1?",
      "type": "typed-answer",
      "answer": "Hidrógeno",
      "explanation": "El hidrógeno es un elemento químico con el símbolo H y número atómico 1."
    }

    **Instructions based on Format:**
    - For "Multiple Choice only", all questions must be "multiple-choice".
    - For "Typed-in answers only", all questions must be "typed-answer".
    - For "A mix of both", create a mix of both types.

    Generate the quiz now in ${languageName}.
  `;

  return prompt;
};
