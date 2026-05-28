import type { SessionConfig, Question } from '../types';

const API_BASE = 'http://localhost:8000';

interface GenerateSessionRequest {
  config: {
    includeSpeaking: boolean;
    includeReadingComprehension: boolean;
    includeCharacterWriting: boolean;
    includeShortEssay: boolean;
    difficulty: string;
    strictness: string;
    focusArea: string;
  };
  selectedDays: number[];
  availableFiles: Record<string, Array<{ name: string; type: string; path: string }>>;
}

interface GenerateSessionResponse {
  questions: Question[];
  metadata: {
    module: string;
    estimatedDuration: number;
    questionCount: number;
  };
}

export async function generateSessionFromAPI(
  config: SessionConfig,
  selectedDays: number[],
  availableFiles: Record<string, Array<{ name: string; type: string; path: string }>>,
): Promise<GenerateSessionResponse> {
  const requestBody: GenerateSessionRequest = {
    config: {
      includeSpeaking: config.includeSpeaking,
      includeReadingComprehension: config.includeReadingComprehension,
      includeCharacterWriting: config.includeCharacterWriting,
      includeShortEssay: config.includeShortEssay,
      difficulty: config.difficulty,
      strictness: config.aiStrictness,
      focusArea: config.focusArea,
    },
    selectedDays,
    availableFiles,
  };

  const response = await fetch(`${API_BASE}/api/generate-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Session generation failed: ${errorText}`);
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<{
  status: string;
  ai_configured: boolean;
  ai_provider: string;
  ai_model: string;
}> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) {
    throw new Error('Backend is not available');
  }
  return response.json();
}
