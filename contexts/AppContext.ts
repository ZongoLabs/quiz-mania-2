import React from 'react';
import { createContext } from 'react';
import { AppInfo, Settings, User, Score, MusicTrack, IconName } from '../types';
import { DEFAULT_SETTINGS, APP_INFO } from '../constants';

interface AppContextType {
  appInfo: AppInfo;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  user: User | null;
  allUsers: User[];
  login: (user: User) => void;
  logout: () => void;
  exitToSplash: () => void;
  createNewUser: (username: string) => Promise<boolean>;
  updateUserAvatar: (avatar: IconName) => void;
  scores: Score[];
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  restartQuiz: () => void;
  openMusicAdmin: () => void;
  loadAndSetPlaylist: () => Promise<void>;
  t: (key: string, options?: any) => string;
  
  // Music Player
  playlist: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  playbackMode: 'single' | 'playlist';
  setPlaybackMode: React.Dispatch<React.SetStateAction<'single' | 'playlist'>>;
  selectTrack: (index: number) => void;
  playPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const AppContext = createContext<AppContextType>({
  appInfo: APP_INFO,
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
  user: null,
  allUsers: [],
  login: () => {},
  logout: () => {},
  exitToSplash: () => {},
  createNewUser: async () => false,
  updateUserAvatar: () => {},
  scores: [],
  openSettingsModal: () => {},
  closeSettingsModal: () => {},
  restartQuiz: () => {},
  openMusicAdmin: () => {},
  loadAndSetPlaylist: async () => {},
  t: (key: string) => key,

  // Music Player Defaults
  playlist: [],
  currentTrack: null,
  isPlaying: false,
  playbackMode: 'playlist',
  setPlaybackMode: () => {},
  selectTrack: () => {},
  playPause: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
});