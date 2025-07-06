import React, { useContext, useEffect } from 'react';
import { Score, IconName } from '../types';
import Icon from './Icon';
import { AppContext } from '../contexts/AppContext';

interface ResultsViewProps {
  score: Score | null;
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ score, onRestart }) => {
  const { scores, t } = useContext(AppContext);
  const percentage = score ? Math.round((score.score / score.total) * 100) : 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Do not trigger if user is interacting with a button (like Share)
            if ((event.target as HTMLElement).tagName !== 'BUTTON') {
                onRestart();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRestart]);

  const getFeedback = (): { title: string; icon: IconName } => {
    if (percentage === 100) return { title: t('results.perfect'), icon: 'Award' };
    if (percentage >= 80) return { title: t('results.excellent'), icon: 'ThumbsUp' };
    if (percentage >= 60) return { title: t('results.good'), icon: 'Sparkles' };
    if (percentage >= 40) return { title: t('results.practice'), icon: 'BrainCircuit' };
    return { title: t('results.betterLuck'), icon: 'Repeat' };
  };

  const feedback = getFeedback();

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: 'Quiz-mania Score',
              text: `I scored ${score?.score}/${score?.total} on Quiz-mania! Can you beat my score?`,
              url: window.location.href,
          }).catch((error) => console.log('Error sharing', error));
      } else {
          // Fallback for browsers that don't support Web Share API
          const text = encodeURIComponent(`I scored ${score?.score}/${score?.total} on Quiz-mania! Can you beat my score? Check it out!`);
          const url = encodeURIComponent(window.location.href);
          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      }
  };

  if (!score) {
    return (
      <div className="text-center">
        <p>No score to display.</p>
        <button onClick={onRestart} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg">
          {t('quizSettings.startQuiz')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
        <Icon name={feedback.icon} className="mx-auto text-primary-500 mb-4" size={64} />
        <h1 className="text-4xl font-bold font-serif text-gray-800 dark:text-white mb-2">{feedback.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{t('results.youScored')}</p>
        <p className="text-7xl font-bold text-primary-600 dark:text-primary-400 my-4">{percentage}%</p>
        <p className="text-xl text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('results.correctOutOf', {score: `<span class="font-bold">${score.score}</span>`, total: `<span class="font-bold">${score.total}</span>`}) }} />

        
        <div className="flex justify-center space-x-4 mt-8">
            <button
                onClick={onRestart}
                className="px-8 py-3 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-transform transform hover:scale-105 flex items-center gap-2"
            >
                <Icon name="Repeat" size={20} />
                {t('results.playAgain')}
            </button>
            <button
                onClick={handleShare}
                className="px-8 py-3 text-lg font-semibold text-primary-600 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/50 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900 transition-transform transform hover:scale-105 flex items-center gap-2"
            >
               <Icon name="Share2" size={20} />
               {t('results.share')}
            </button>
        </div>
      </div>

      <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-6">{t('results.leaderboard')}</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
              <ul className="space-y-4">
                  {scores.length > 0 ? scores.slice(0, 10).map((s, index) => (
                      <li key={s.timestamp + s.username} className={`flex items-center justify-between p-4 rounded-lg ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                          <div className="flex items-center">
                              <span className="text-lg font-bold w-8 text-center">{index + 1}</span>
                              <span className="ml-4 font-semibold text-gray-800 dark:text-gray-200">{s.username}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg text-primary-500">{s.score}/{s.total}</span>
                            <p className="text-xs text-gray-500">{s.level}</p>
                          </div>
                      </li>
                  )) : (
                    <p className="text-center text-gray-500 py-4">{t('results.noScores')}</p>
                  )}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default ResultsView;