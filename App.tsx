
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppState, QuizConfig, User, Settings, QuizQuestion, Score, MusicTrack, IconName } from './types';
import { APP_INFO, DEFAULT_SETTINGS, THEME_COLORS, AVATAR_ICONS } from './constants';
import { AppContext } from './contexts/AppContext';
import SplashScreen from './components/SplashScreen';
import QuizSettings from './components/QuizSettings';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import MusicAdminModal from './components/MusicAdminModal';
import LoginScreen from './components/LoginScreen';
import QuickSetupPopup from './components/QuickSetupPopup';
import AdminDashboard from './components/AdminDashboard';
import { GoogleGenAI } from '@google/genai';
import { generateQuizPrompt } from './lib/promptHelper';
import { getTracks } from './lib/indexedDbHelper';
import { getTranslator } from './lib/i18n';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [scores, setScores] = useState<Score[]>([]);
  const [lastScore, setLastScore] = useState<Score | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  
  // Music Player State
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAppReadyForAudio, setAppReadyForAudio] = useState(false);
  const [isMusicAdminOpen, setMusicAdminOpen] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'single' | 'playlist'>('playlist');
  const prevPlaylistLengthRef = useRef<number>(0);

  // i18n state
  const [t, setT] = useState<(key: string, options?: any) => string>(() => (key: string) => key);
  const [isI18nReady, setIsI18nReady] = useState(false);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translator = await getTranslator(settings.language);
        setT(() => translator);
      } catch (e) {
        console.error("Failed to load translations:", e);
      } finally {
        if (!isI18nReady) {
          setIsI18nReady(true);
        }
      }
    };
    loadTranslations();
  }, [settings.language, isI18nReady]);

  const loadAndSetPlaylist = useCallback(async () => {
    try {
      const records = await getTracks();
      const trackUrls = records.map(r => ({ name: r.name, url: URL.createObjectURL(r.file) }));
      setPlaylist(trackUrls);
    } catch (e) {
      console.error("Failed to load music playlist:", e);
    }
  }, []);

  // Autoplay music when it first becomes available after user interaction
  useEffect(() => {
    // This effect starts playback automatically when the playlist transitions from empty to having tracks,
    // provided the user has already interacted with the app (isAppReadyForAudio).
    if (isAppReadyForAudio && prevPlaylistLengthRef.current === 0 && playlist.length > 0) {
        setIsPlaying(true);
    }
    // Update the ref for the next render to track the current state.
    prevPlaylistLengthRef.current = playlist.length;
  }, [playlist, isAppReadyForAudio]);

  // Load data on initial mount
  useEffect(() => {
    loadAndSetPlaylist();
    try {
      const storedUsers = localStorage.getItem('quizmania_all_users');
      if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      }
      
      const storedSettings = localStorage.getItem('quizmania_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(s => ({...s, ...parsedSettings}));
      }

      const storedScores = localStorage.getItem('quizmania_scores');
      if(storedScores) setScores(JSON.parse(storedScores));
    } catch (e) { console.error("Failed to load data from localStorage", e); }
  }, [loadAndSetPlaylist]);

  // Keyboard shortcut for admin dashboard
   useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'B') {
        event.preventDefault();
        setAppState(prev => prev === AppState.ADMIN_DASHBOARD ? AppState.SETTINGS : AppState.ADMIN_DASHBOARD);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    localStorage.setItem('quizmania_settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.lang = settings.language;
    const root = document.querySelector(':root') as HTMLElement;
    if (root) {
      const theme = THEME_COLORS.find(t => t.name === settings.themeColor);
      if(theme){
        for (const [key, value] of Object.entries(theme.colors)) {
            root.style.setProperty(`--color-primary-${key}`, value);
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quizmania_scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('quizmania_all_users', JSON.stringify(allUsers));
  }, [allUsers]);


  // --- Music Player Logic ---
  const playPause = useCallback(() => {
    if (!isAppReadyForAudio || playlist.length === 0) return;
    setIsPlaying(prev => !prev);
  }, [isAppReadyForAudio, playlist.length]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentTrackIndex(prev => (prev - 1 + playlist.length) % playlist.length);
  }, [playlist.length]);

  const selectTrack = useCallback((index: number) => {
    if (!isAppReadyForAudio || index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, [isAppReadyForAudio, playlist.length]);
  
  const handleTrackEnd = useCallback(() => {
    if (playbackMode === 'playlist') {
      nextTrack();
    }
  }, [playbackMode, nextTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.error("Audio play failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if(audio) audio.volume = settings.musicVolume;
  }, [settings.musicVolume]);

  const handleSplashFinish = useCallback(() => {
    setAppState(AppState.LOGIN);
  }, []);
  // --- End Music Player Logic ---
  
  // --- User Management ---
  const login = useCallback((userToLogin: User) => {
    const updatedUser = {
      ...userToLogin,
      logins: [...(userToLogin.logins || []), { timestamp: Date.now() }]
    };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));

    localStorage.setItem('quizmania_current_user_name', userToLogin.username);
    setAppReadyForAudio(true);
    if (playlist.length > 0) {
      setIsPlaying(true);
    }
    setAppState(AppState.QUICK_SETUP);
  }, [playlist.length]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('quizmania_current_user_name');
    setSettingsModalOpen(false);
    setIsPlaying(false);
    setAppState(AppState.LOGIN);
  }, []);
  
  const exitToSplash = useCallback(() => {
    setUser(null);
    localStorage.removeItem('quizmania_current_user_name');
    setIsPlaying(false);
    setSettingsModalOpen(false);
    setAppState(AppState.SPLASH);
  }, []);
  
  const createNewUser = useCallback(async (username: string): Promise<boolean> => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert(t('login.usernameEmptyAlert'));
      return false;
    }
    if (allUsers.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase())) {
      alert(t('login.usernameExistsAlert'));
      return false;
    }
    const randomAvatar = AVATAR_ICONS[Math.floor(Math.random() * AVATAR_ICONS.length)];
    const newUser: User = { 
      username: trimmedUsername, 
      logins: [],
      avatar: randomAvatar,
    };
    setAllUsers(prev => [...prev, newUser].sort((a,b) => a.username.localeCompare(b.username)));
    login(newUser);
    return true;
  }, [allUsers, login, t]);
  
  const updateUserAvatar = useCallback((avatar: IconName) => {
    if (!user) return;
    
    const updatedUser = { ...user, avatar };
    setUser(updatedUser);

    setAllUsers(prev => 
      prev.map(u => u.username === user.username ? updatedUser : u)
    );
  }, [user]);


  const startQuiz = useCallback(async (config: QuizConfig) => {
    setQuizConfig(config);
    setIsLoading(true);
    setError(null);
    setAppState(AppState.LOADING);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const prompt = generateQuizPrompt(config, settings.language);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.7 },
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();
      
      // Fix for AI sometimes returning an array of objects without commas between them
      const fixedJsonStr = jsonStr.replace(/}\s*{/g, '},{');

      const parsedQuestions = JSON.parse(fixedJsonStr);

      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        setQuestions(parsedQuestions);
        setAppState(AppState.QUIZ);
      } else {
        throw new Error("Generated content is not a valid quiz array.");
      }
    } catch (e) {
      console.error("Failed to generate quiz:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred while generating the quiz.");
      setAppState(AppState.SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [settings.language]);

  const finishQuiz = useCallback((finalScore: Score) => {
    setLastScore(finalScore);
    setScores(prevScores => [...prevScores, finalScore].sort((a, b) => b.score - a.score).slice(0, 20));
    setAppState(AppState.RESULTS);
  }, []);

  const restartQuiz = useCallback(() => {
    // This function now only triggers the state change.
    // The actual cleanup of quiz data is handled in a useEffect hook
    // to prevent race conditions.
    setAppState(AppState.SETTINGS);
  }, []);

  // This effect hook safely cleans up quiz data when returning to the settings screen.
  useEffect(() => {
    if (appState === AppState.SETTINGS) {
      setQuestions([]);
      setQuizConfig(null);
      setLastScore(null);
    }
  }, [appState]);
  
  const contextValue = useMemo(() => ({
    appInfo: APP_INFO,
    settings,
    setSettings,
    user,
    allUsers,
    login,
    logout,
    exitToSplash,
    createNewUser,
    updateUserAvatar,
    scores,
    openSettingsModal: () => setSettingsModalOpen(true),
    closeSettingsModal: () => setSettingsModalOpen(false),
    restartQuiz,
    openMusicAdmin: () => setMusicAdminOpen(true),
    loadAndSetPlaylist,
    t,
    // Music context
    playlist,
    currentTrack: playlist[currentTrackIndex] || null,
    isPlaying,
    playbackMode,
    setPlaybackMode,
    selectTrack,
    playPause,
    nextTrack,
    prevTrack,
  }), [
      settings, 
      user, 
      allUsers, 
      login, 
      logout, 
      exitToSplash, 
      createNewUser, 
      updateUserAvatar, 
      scores, 
      restartQuiz, 
      loadAndSetPlaylist, 
      t, 
      playlist, 
      currentTrackIndex, 
      isPlaying, 
      playbackMode, 
      selectTrack, 
      playPause, 
      nextTrack, 
      prevTrack
  ]);

  const showLayout = ![AppState.SPLASH, AppState.LOGIN, AppState.QUICK_SETUP, AppState.ADMIN_DASHBOARD].includes(appState);

  const renderContent = () => {
    switch (appState) {
      case AppState.SPLASH: return <SplashScreen onFinish={handleSplashFinish} />;
      case AppState.LOGIN: return <LoginScreen />;
      case AppState.QUICK_SETUP: return <QuickSetupPopup onClose={() => setAppState(AppState.SETTINGS)} onPlaylistUpdate={loadAndSetPlaylist} />;
      case AppState.ADMIN_DASHBOARD: return <AdminDashboard onExit={() => setAppState(AppState.SETTINGS)} />;
      case AppState.SETTINGS: return <QuizSettings onStartQuiz={startQuiz} error={error} isLoading={isLoading} />;
      case AppState.LOADING: return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t('loading.generatingQuiz')}</p>
          </div>
        );
      case AppState.QUIZ:
        if (!quizConfig || questions.length === 0) {
          setError("Something went wrong. Quiz data is missing.");
          setAppState(AppState.SETTINGS);
          return null;
        }
        return <QuizView config={quizConfig} questions={questions} onFinishQuiz={finishQuiz} />;
      case AppState.RESULTS: return <ResultsView score={lastScore} onRestart={restartQuiz} />;
      default: return <SplashScreen onFinish={handleSplashFinish} />;
    }
  };

  if (!isI18nReady) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen w-full ${settings.theme}`}>
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 min-h-screen">
          {showLayout && <Header />}
          <main className={showLayout ? "p-4 sm:p-6 lg:p-8" : ""}>{renderContent()}</main>
          {isSettingsModalOpen && <SettingsModal />}
          {isMusicAdminOpen && <MusicAdminModal onClose={() => setMusicAdminOpen(false)} onPlaylistUpdate={loadAndSetPlaylist} />}
          <audio ref={audioRef} src={playlist[currentTrackIndex]?.url} onEnded={handleTrackEnd} loop={playbackMode === 'single'} />
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
