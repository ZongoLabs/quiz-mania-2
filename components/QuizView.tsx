
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { QuizConfig, QuizQuestion, Score } from '../types';
import Icon from './Icon';
import { AppContext } from '../contexts/AppContext';

interface QuizViewProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onFinishQuiz: (score: Score) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ config, questions, onFinishQuiz }) => {
  const { user, settings, t } = useContext(AppContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timer);
  
  const currentQuestion = questions[currentQuestionIndex];

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setTimeLeft(config.timer);
    } else {
      onFinishQuiz({
        username: user?.username || 'Guest',
        score,
        total: questions.length,
        level: config.level,
        subject: config.subjects.join(', '),
        timestamp: Date.now()
      });
    }
  }, [currentQuestionIndex, questions.length, onFinishQuiz, score, user, config]);

  useEffect(() => {
    if (config.timer && timeLeft !== null && timeLeft > 0 && !isAnswered) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (config.timer && timeLeft !== null && timeLeft === 0 && !isAnswered) {
      setIsAnswered(true);
      setIsCorrect(false);
    }
  }, [timeLeft, config.timer, isAnswered]);

  const handleAnswerSubmit = (answer: string) => {
    if (isAnswered) return;

    setUserAnswer(answer);
    setIsAnswered(true);
    const correctAnswer = currentQuestion.answer.toLowerCase().trim();
    const submittedAnswer = answer.toLowerCase().trim();

    if (submittedAnswer === correctAnswer) {
      setScore(s => s + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };
  
  const speak = (text: string) => {
    if (!settings.readAloud) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  const readQuestionAloud = () => {
    let textToSpeak = currentQuestion.question;
    if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
        const optionsText = currentQuestion.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('. ');
        textToSpeak += `. ${optionsText}`;
    }
    speak(textToSpeak);
  };
  
  // Basic speech recognition setup - would need more robust implementation for production
    useEffect(() => {
        if (!settings.voiceCommands || !('webkitSpeechRecognition' in window)) {
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = settings.language;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim().replace('.', '');
            console.log('Heard:', transcript);

            if (isAnswered) {
                if(transcript.includes('next') || transcript.includes('siguiente') || transcript.includes('suivant')) {
                    handleNextQuestion();
                }
                return;
            }
            
            if (currentQuestion.type === 'multiple-choice') {
                if (transcript.includes('alpha') || transcript === 'a') handleAnswerSubmit(currentQuestion.options?.[0] || '');
                else if (transcript.includes('bravo') || transcript === 'b') handleAnswerSubmit(currentQuestion.options?.[1] || '');
                else if (transcript.includes('charlie') || transcript === 'c') handleAnswerSubmit(currentQuestion.options?.[2] || '');
                else if (transcript.includes('delta') || transcript === 'd') handleAnswerSubmit(currentQuestion.options?.[3] || '');
            } else {
                 handleAnswerSubmit(transcript);
            }
        };

        const startRecognition = () => {
          try {
            recognition.start();
          } catch(e) {
            console.log("Recognition already started");
          }
        };

        const id = setInterval(startRecognition, 4000);

        return () => {
            clearInterval(id);
            recognition.stop();
        };
    }, [settings.voiceCommands, settings.language, currentQuestion, isAnswered, handleNextQuestion]);


  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{config.level} - {config.subjects.join(', ')}</p>
          <p className="font-bold text-xl">{t('quizView.question', { current: currentQuestionIndex + 1, total: questions.length })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('quizView.score')}</p>
          <p className="font-bold text-xl text-green-500">{score}</p>
        </div>
      </div>

      {/* Timer Bar */}
      {config.timer && timeLeft !== null && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-primary-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / config.timer) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl min-h-[300px] flex flex-col">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold mb-6 flex-1">{currentQuestion.question}</h2>
            <button onClick={readQuestionAloud} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('quizView.readAloud')}>
              <Icon name="Volume2" size={24} />
            </button>
        </div>

        {/* Answer Area */}
        <div className="flex-grow">
          {currentQuestion.type === 'multiple-choice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = userAnswer === option;
                let buttonClass = 'bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600';
                if (isAnswered) {
                  if (option === currentQuestion.answer) {
                    buttonClass = 'bg-green-500 text-white';
                  } else if (isSelected) {
                    buttonClass = 'bg-red-500 text-white';
                  }
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    disabled={isAnswered}
                    className={`p-4 rounded-lg text-left transition-all duration-300 transform disabled:cursor-not-allowed ${buttonClass} ${isSelected && !isAnswered ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'typed-answer' && (
            <div>
              <input
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnswerSubmit(userAnswer)}
                disabled={isAnswered}
                placeholder={t('quizView.typeAnswer')}
                className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {!isAnswered && (
                <button onClick={() => handleAnswerSubmit(userAnswer)} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">{t('quizView.submit')}</button>
              )}
            </div>
          )}
        </div>
        
        {/* Feedback Section */}
        {isAnswered && (
          <div className={`mt-6 p-4 rounded-lg animate-fade-in ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
            <h3 className={`font-bold text-lg ${isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {isCorrect ? t('quizView.correct') : t('quizView.incorrect')}
            </h3>
            {currentQuestion.type === 'typed-answer' && !isCorrect && (
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('quizView.correctAnswer')} <span className="font-semibold">{currentQuestion.answer}</span></p>
            )}
            {currentQuestion.explanation && (
              <p className="mt-2 text-gray-800 dark:text-gray-200">{currentQuestion.explanation}</p>
            )}
            <button onClick={handleNextQuestion} className="mt-4 w-full md:w-auto px-8 py-3 text-white font-bold bg-gray-800 dark:bg-gray-200 dark:text-gray-900 rounded-lg hover:opacity-90 flex items-center justify-center ml-auto">
              {currentQuestionIndex < questions.length - 1 ? t('quizView.nextQuestion') : t('quizView.finishQuiz')}
              <Icon name="ArrowRight" className="ml-2" size={20}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
