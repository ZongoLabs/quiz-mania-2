import { icons } from 'lucide-react';

export type IconName = Extract<keyof typeof icons, string>;

export enum AppState {
  SPLASH,
  LOGIN,
  QUICK_SETUP,
  SETTINGS,
  LOADING,
  QUIZ,
  RESULTS,
  ADMIN_DASHBOARD
}

export interface User {
  username: string;
  logins?: { timestamp: number }[];
  avatar?: IconName;
}

export interface Settings {
  theme: 'light' | 'dark';
  themeColor: string;
  language: string;
  voiceCommands: boolean;
  readAloud: boolean;
  musicVolume: number;
}

export interface QuizConfig {
  level: string;
  subjects: string[];
  questionCount: number;
  repetitionCycle: string;
  format: 'Multiple Choice only' | 'Typed-in answers only' | 'A mix of both';
  timer: number | null;
}

export type QuestionType = 'multiple-choice' | 'typed-answer' | 'comprehension' | 'dictation' | 'picture-id' | 'listening-comprehension';

export interface QuizQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  answer: string;
  explanation?: string;
  passage?: string; // For comprehension
  image_url?: string; // For picture-id
  labels?: string[]; // For picture-id
}

export interface Score {
  username: string;
  score: number;
  total: number;
  level: string;
  subject: string;
  timestamp: number;
}

export interface AppInfo {
  name: string;
  version: string;
  creator: {
    name: string;
    email: string;
  };
  copyright: string;
}

export interface ThemeColor {
    name: string;
    label: string;
    colors: Record<string, string>;
}

export interface MusicTrack {
    name: string;
    url: string;
}

// This is a special type provided by the hosting environment for the Code Assistant
declare global {
  interface Window {
    frame?: {
      ai?: {
        prompt: (prompt: string) => Promise<void>;
      };
    };
  }
}
