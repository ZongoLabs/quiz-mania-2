import React, { useState, useContext, useEffect } from 'react';
import { QuizConfig } from '../types';
import { ACADEMIC_LEVELS, SUBJECTS, QUESTION_COUNTS, REPETITION_CYCLES, QUESTION_FORMATS, TIMER_OPTIONS } from '../constants';
import { AppContext } from '../contexts/AppContext';
import Icon from './Icon';

interface QuizSettingsProps {
  onStartQuiz: (config: QuizConfig) => void;
  error: string | null;
  isLoading: boolean;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ onStartQuiz, error, isLoading }) => {
  const { 
    user,
    playlist,
    currentTrack,
    isPlaying,
    playPause,
    nextTrack,
    prevTrack,
    playbackMode,
    setPlaybackMode,
    t,
  } = useContext(AppContext);

  const [level, setLevel] = useState(ACADEMIC_LEVELS[0]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(QUESTION_COUNTS[0]);
  const [repetitionCycle, setRepetitionCycle] = useState(REPETITION_CYCLES[1]);
  const [format, setFormat] = useState<QuizConfig['format']>(QUESTION_FORMATS[0] as QuizConfig['format']);
  const [timer, setTimer] = useState<number | null>(30);

  const handleSubjectToggle = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjects.length === 0) {
      alert(t('quizSettings.selectSubjectAlert'));
      return;
    }
    const config: QuizConfig = { level, subjects, questionCount, repetitionCycle, format, timer };
    onStartQuiz(config);
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't do anything if the quiz is loading or no subjects are selected.
      if (isLoading || subjects.length === 0) return;

      if (event.key === 'Enter') {
        const target = event.target as HTMLElement;
        const interactiveTags = ['BUTTON', 'SELECT', 'INPUT', 'TEXTAREA', 'A'];

        // If the focused element is not an interactive one, treat Enter as a shortcut to start the quiz.
        if (!interactiveTags.includes(target.tagName)) {
          event.preventDefault();
          const config: QuizConfig = { level, subjects, questionCount, repetitionCycle, format, timer };
          onStartQuiz(config);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, subjects, level, questionCount, repetitionCycle, format, timer, onStartQuiz]);

  const formatTranslationMap: { [key: string]: string } = {
    'Multiple Choice only': 'quizSettings.formatMultipleChoiceOnly',
    'Typed-in answers only': 'quizSettings.formatTypedAnswersOnly',
    'A mix of both': 'quizSettings.formatAMixOfBoth',
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-serif text-primary-600 dark:text-primary-400">{t('quizSettings.welcome', {username: user?.username})}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('quizSettings.subtitle')}</p>
      </div>

      {/* Minimal Music Controls */}
      {playlist.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4 w-full">
                {/* Playback Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={prevTrack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" disabled={playlist.length <= 1} aria-label="Previous track">
                        <Icon name="SkipBack" size={18} />
                    </button>
                    <button onClick={playPause} className="p-3 w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600" aria-label={isPlaying ? "Pause music" : "Play music"}>
                        <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
                    </button>
                    <button onClick={nextTrack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" disabled={playlist.length <= 1} aria-label="Next track">
                        <Icon name="SkipForward" size={18} />
                    </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0 text-center mx-2">
                    <p className="font-medium truncate text-gray-800 dark:text-gray-200" title={currentTrack?.name || 'No music selected'}>
                        {currentTrack?.name || t('quizSettings.noMusic')}
                    </p>
                </div>

                {/* Playback Mode */}
                <div className="flex items-center">
                    <button
                        onClick={() => setPlaybackMode(mode => mode === 'playlist' ? 'single' : 'playlist')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label={playbackMode === 'playlist' ? 'Switch to repeat one' : 'Switch to repeat all'}
                        title={playbackMode === 'playlist' ? t('quizSettings.repeatAll') : t('quizSettings.repeatSingle')}
                    >
                        <Icon name={playbackMode === 'playlist' ? 'Repeat' : 'Repeat1'} size={18} className="text-primary-500" />
                    </button>
                </div>
            </div>
        </div>
      )}


      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{t('quizSettings.errorTitle')}</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Academic Level */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.level')}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ACADEMIC_LEVELS.map(l => (
              <button
                type="button"
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${level === l ? 'bg-primary-600 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.subjects')}</label>
          <div className="space-y-4">
            {Object.entries(SUBJECTS).map(([category, subjectList]) => (
              <details key={category} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm" open={category === "Sciences"}>
                <summary className="font-semibold cursor-pointer text-primary-700 dark:text-primary-300">{category}</summary>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {subjectList.map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleSubjectToggle(s)}
                      className={`px-3 py-2 text-left rounded-md text-sm transition-colors ${subjects.includes(s) ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                      {subjects.includes(s) ? <Icon name="Check" className="inline-block mr-2" size={16}/> : <Icon name="Plus" className="inline-block mr-2" size={16}/>}
                      {s}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Other Options */}
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <label htmlFor="question-count" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.quizLength')}</label>
                <select id="question-count" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                    {QUESTION_COUNTS.map(c => <option key={c} value={c}>{c} {t('quizSettings.questions')}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="question-format" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.questionFormat')}</label>
                <select id="question-format" value={format} onChange={e => setFormat(e.target.value as QuizConfig['format'])} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                    {QUESTION_FORMATS.map(f => (
                      <option key={f} value={f}>
                        {t(formatTranslationMap[f])}
                      </option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="repetition-cycle" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.repetition')}</label>
                <select id="repetition-cycle" value={repetitionCycle} onChange={e => setRepetitionCycle(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500">
                    {REPETITION_CYCLES.map(r => <option key={r} value={r}>{r === "Infinity" ? t('quizSettings.repetitionInfinity') : t('quizSettings.repetitionAfter', {count: r})}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="timer-select" className="block text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('quizSettings.timer')}</label>
                 <select 
                  id="timer-select" 
                  value={timer === null ? 'null' : timer} 
                  onChange={e => setTimer(e.target.value === 'null' ? null : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {TIMER_OPTIONS.map(opt => (
                    <option key={opt.label} value={opt.value === null ? 'null' : opt.value}>
                      {opt.value === null ? t('quizSettings.timerOff') : t('quizSettings.timerSeconds', { count: opt.value })}
                    </option>
                  ))}
                </select>
            </div>
        </div>

        <div className="text-center pt-4">
          <button 
            type="submit"
            disabled={isLoading || subjects.length === 0}
            className="w-full md:w-auto px-12 py-4 text-xl font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                {t('quizSettings.generating')}
              </>
            ) : (
              <>
                <Icon name="Play" className="mr-3" size={24} />
                {t('quizSettings.startQuiz')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizSettings;