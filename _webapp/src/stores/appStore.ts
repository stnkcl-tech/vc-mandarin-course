import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContextStructure, ReviewSession, SessionConfig, SessionReport } from '../types';
import { generateSessionId, calculateScores, generateReport } from '../utils/helpers';

interface AppStore {
  // Context
  context: ContextStructure | null;
  setContext: (context: ContextStructure) => void;

  // Session
  currentSession: ReviewSession | null;
  sessions: ReviewSession[];
  createSession: (config: SessionConfig) => ReviewSession;
  setSessionQuestions: (questions: ReviewSession['questions']) => void;
  submitAnswer: (questionId: string, value: unknown, skipped?: boolean) => void;
  completeSession: () => SessionReport | null;
  setSessionStatus: (status: ReviewSession['status']) => void;

  // Reports
  reports: SessionReport[];
  addReport: (report: SessionReport) => void;

  // Navigation
  currentView: 'dashboard' | 'materials' | 'generator' | 'session' | 'report' | 'history';
  setCurrentView: (view: AppStore['currentView']) => void;

  // Theme
  theme: 'system' | 'light' | 'dark' | 'oled';
  setTheme: (theme: AppStore['theme']) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      context: null,
      setContext: (context) => set({ context }),

      currentSession: null,
      sessions: [],
      createSession: (config) => {
        const sessions = get().sessions;
        const newSession: ReviewSession = {
          id: generateSessionId(),
          number: sessions.length + 1,
          createdAt: Date.now(),
          config,
          status: 'idle',
          questions: [],
          answers: [],
          currentQuestionIndex: 0,
          scores: {
            overall: 0,
            speaking: { name: 'Speaking', score: 0, status: 'Needs Support', note: '' },
            reading: { name: 'Reading', score: 0, status: 'Needs Support', note: '' },
            writing: { name: 'Writing', score: 0, status: 'Needs Support', note: '' },
          },
          timeSpent: 0,
        };
        set({ currentSession: newSession });
        return newSession;
      },
      setSessionQuestions: (questions) => {
        const session = get().currentSession;
        if (session) {
          set({ currentSession: { ...session, questions, status: 'ready' } });
        }
      },
      submitAnswer: (questionId, value, skipped = false) => {
        const session = get().currentSession;
        if (!session) return;

        const existingIndex = session.answers.findIndex(a => a.questionId === questionId);
        const answer = {
          questionId,
          value: value as any,
          submittedAt: Date.now(),
          skipped,
        };

        const newAnswers = [...session.answers];
        if (existingIndex >= 0) {
          newAnswers[existingIndex] = answer;
        } else {
          newAnswers.push(answer);
        }

        set({
          currentSession: {
            ...session,
            answers: newAnswers,
            currentQuestionIndex: Math.min(session.currentQuestionIndex + 1, session.questions.length - 1),
          },
        });
      },
      completeSession: () => {
        const session = get().currentSession;
        if (!session) return null;

        const completedSession = {
          ...session,
          status: 'completed' as const,
          scores: calculateScores(session),
          timeSpent: Math.floor((Date.now() - session.createdAt) / 1000),
        };

        const report = generateReport(completedSession);

        set({
          currentSession: completedSession,
          sessions: [...get().sessions, completedSession],
          reports: [...get().reports, report],
        });

        return report;
      },
      setSessionStatus: (status) => {
        const session = get().currentSession;
        if (session) {
          set({ currentSession: { ...session, status } });
        }
      },

      reports: [],
      addReport: (report) => set({ reports: [...get().reports, report] }),

      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),

      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'mandarin-mastery-storage',
      partialize: (state) => ({ sessions: state.sessions, reports: state.reports, theme: state.theme }),
    }
  )
);
