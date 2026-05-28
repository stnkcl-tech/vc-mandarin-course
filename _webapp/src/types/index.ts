export interface ContextFile {
  name: string;
  path: string;
  size: number;
  type: 'pdf' | 'docx' | 'txt' | 'epub' | 'audio' | 'image' | 'video' | 'other';
  lastModified: number;
}

export interface DayFolder {
  dayNumber: number;
  name: string;
  files: ContextFile[];
}

export interface ContextStructure {
  valid: boolean;
  errors: string[];
  master: {
    exists: boolean;
    files: ContextFile[];
    textbook?: ContextFile;
    workbook?: ContextFile;
  };
  supporting: {
    exists: boolean;
    days: DayFolder[];
  };
}

export type CurriculumModule = {
  id: number;
  title: string;
  duration: string;
};

export const CURRICULUM_MODULES: CurriculumModule[] = [
  { id: 1, title: 'Foundations — Pinyin, Tones & Basic Greetings', duration: '7–10 days' },
  { id: 2, title: 'Essential Grammar & Daily Expressions', duration: '10–12 days' },
  { id: 3, title: 'Numbers, Dates, Time & Shopping', duration: '10–12 days' },
  { id: 4, title: 'Family, Relationships & Descriptions', duration: '10–12 days' },
  { id: 5, title: 'Food, Dining & Chinese Cuisine Culture', duration: '10–12 days' },
  { id: 6, title: 'Transportation, Travel & Directions', duration: '10–12 days' },
  { id: 7, title: 'Work, Study & Daily Routine', duration: '10–12 days' },
  { id: 8, title: 'Hobbies, Entertainment & Social Life', duration: '10–12 days' },
  { id: 9, title: 'Health, Body & Emotions', duration: '10–12 days' },
  { id: 10, title: 'Technology, Internet & Modern Life', duration: '10–12 days' },
  { id: 11, title: 'Culture, Traditions & Society', duration: '10–12 days' },
  { id: 12, title: 'Fluency & Real-World Mastery', duration: '14–16 days' },
];

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TimeLimit = 'None' | '30 min' | '45 min' | '60 min';
export type FocusArea = 'Balanced' | 'Speaking-heavy' | 'Reading-heavy' | 'Writing-heavy' | 'Grammar-focus' | 'Vocabulary-focus';
export type AIStrictness = 'Lenient' | 'Normal' | 'Strict';

export interface SessionConfig {
  selectedMasters: string[];
  selectedDays: number[];
  moduleId: number;
  includeSpeaking: boolean;
  includeToneDrills: boolean;
  includeCharacterRecognition: boolean;
  includeReadingComprehension: boolean;
  includeSpeedReading: boolean;
  includeCharacterWriting: boolean;
  includeSentenceComposition: boolean;
  includeShortEssay: boolean;
  difficulty: Difficulty;
  timeLimit: TimeLimit;
  focusArea: FocusArea;
  aiStrictness: AIStrictness;
}

export type QuestionType = 'speaking' | 'reading' | 'writing-character' | 'writing-essay';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  section: string;
  prompt: string;
  instructions?: string;
  sourceDay?: number;
  explanation?: string;
}

export interface SpeakingQuestion extends BaseQuestion {
  type: 'speaking';
  maxDuration: number;
  tips?: string[];
  rubric?: string[];
}

export interface ReadingQuestion extends BaseQuestion {
  type: 'reading';
  passage: string;
  passagePinyin?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  hasAudioNarration?: boolean;
}

export interface WritingCharacterQuestion extends BaseQuestion {
  type: 'writing-character';
  character: string;
  pinyin: string;
  meaning: string;
  strokeCount: number;
  etymology?: string;
}

export interface WritingEssayQuestion extends BaseQuestion {
  type: 'writing-essay';
  topic: string;
  minChars: number;
  maxChars: number;
  requirements: string[];
  template?: string;
}

export type Question = SpeakingQuestion | ReadingQuestion | WritingCharacterQuestion | WritingEssayQuestion;

export type AnswerValue = string | string[] | { text?: string; audioBlob?: Blob | null; imageData?: string } | null;

export interface Answer {
  questionId: string;
  value: AnswerValue;
  submittedAt: number;
  skipped: boolean;
}

export type SessionStatus = 'idle' | 'generating' | 'ready' | 'active' | 'paused' | 'completed';

export interface ReviewSession {
  id: string;
  number: number;
  createdAt: number;
  config: SessionConfig;
  status: SessionStatus;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  scores: SessionScores;
  timeSpent: number;
}

export interface SkillScore {
  name: string;
  score: number;
  status: 'Excellent' | 'Proficient' | 'Developing' | 'Needs Support';
  note: string;
}

export interface SessionScores {
  overall: number;
  speaking: SkillScore;
  reading: SkillScore;
  writing: SkillScore;
}

export interface PerformanceInsight {
  type: 'strength' | 'weakness' | 'pattern';
  title: string;
  items: string[];
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  why: string;
  action: string;
  target: string;
  resource?: string;
}

export interface QuestionReview {
  questionId: string;
  status: 'correct' | 'incorrect' | 'skipped';
  questionText: string;
  questionType: string;
  yourAnswer: string;
  correctAnswer?: string;
  explanation: string;
  resource?: string;
}

export interface SessionReport {
  sessionId: string;
  sessionNumber: number;
  date: string;
  moduleId: number;
  duration: number;
  overallScore: number;
  skillBreakdown: SkillScore[];
  insights: PerformanceInsight[];
  recommendations: Recommendation[];
  questionReviews: QuestionReview[];
}

export interface AppState {
  theme: 'light' | 'dark' | 'oled';
  sidebarOpen: boolean;
}
