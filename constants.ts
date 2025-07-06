import { Settings, AppInfo, ThemeColor, IconName } from './types';

export const APP_INFO: AppInfo = {
  name: "Quiz-mania",
  version: "v1.0.0",
  creator: {
    name: "kmbuami",
    email: "contact@kmbuami.dev"
  },
  copyright: "Copyright © 2025 kmbuami. All Rights Reserved."
};

export const ACADEMIC_LEVELS = [
  "Stage 1-3",
  "Stage 4-6",
  "Stage 7-10",
  "Stage 11-13",
  "College & University",
];

export const SUBJECTS = {
  "Sciences": ["Physics", "Chemistry", "Biology", "Human Biology", "Plant Biology", "Animal Biology", "General Science", "Ecology"],
  "Mathematics": ["Mathematics", "Statistics"],
  "English": ["American English", "British English", "Comprehension", "Dictation"],
  "History & Social Sciences": ["World History", "History by Continent", "History by Country", "Political Science", "Archaeology", "Social Science", "Governance", "Geography"],
  "Business & Law": ["Accounting", "Costing", "Law", "Economics"],
  "Engineering": ["Electrical", "Computer", "Biomedical", "Mechanical", "Chemical", "Aeronautics", "Marine", "Telecommunication"],
  "Medical Fields": ["Biomed", "Pharmacy", "Medicine", "Veterinary"],
  "Arts & Humanities": ["Music", "Arts", "Art History"],
  "Religion & Philosophy": ["Religion", "Theology"],
  "Education": ["Education"],
  "Languages": ["French", "Spanish", "Chinese", "Japanese", "German", "Russian", "Swahili", "Arabic", "Hebrew", "Portuguese", "Latin"],
  "Vocational & Applied Studies": ["Agriculture", "Textiles", "Computer Science", "Catering", "Food Science", "Home Economics", "Hospitality", "ICT", "Communication Studies"],
  "General": ["General Knowledge"],
};

export const QUESTION_COUNTS = [10, 20, 30, 50, 75, 100, 200, 300, 500, 1000];
export const REPETITION_CYCLES = ["50", "100", "500", "1000", "3000", "5000", "10000", "Infinity"];
export const QUESTION_FORMATS = ['Multiple Choice only', 'Typed-in answers only', 'A mix of both'];

export const TIMER_OPTIONS = [
    { value: null, label: 'Off' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '60 seconds' },
    { value: 90, label: '90 seconds' },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  themeColor: 'Blue',
  language: 'en',
  voiceCommands: true,
  readAloud: true,
  musicVolume: 0.5,
};

export const THEME_COLORS: ThemeColor[] = [
    { name: 'Blue', label: 'bg-blue-500', colors: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' } },
    { name: 'Green', label: 'bg-green-500', colors: { '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac', '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d', '800': '#166534', '900': '#14532d', '950': '#052e16' } },
    { name: 'Rose', label: 'bg-rose-500', colors: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' } },
    { name: 'Orange', label: 'bg-orange-500', colors: { '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74', '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c', '800': '#9a3412', '900': '#7c2d12', '950': '#431407' } }
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
];

export const AVATAR_ICONS: IconName[] = [
  'User', 'UserRound', 'CircleUser', 'CircleUserRound', 'UserCog', 
  'UserCheck', 'UserPlus', 'UserX', 'UserMinus', 'PersonStanding',
  'Smile', 'Meh', 'Frown', 'Baby', 'Accessibility', 
  'Contact', 'UserSearch', 'KeyRound', 'Mail', 'Shield'
];