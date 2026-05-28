import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, Pause, Mic, CheckCircle, BookOpen, BookText, PenTool } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { CURRICULUM_MODULES } from '../types';
import type { Question, Answer, ReviewSession } from '../types';

type Phase = 'summary' | 'question' | 'feedback' | 'complete';

interface FeedbackData {
  status: 'correct' | 'incorrect' | 'skipped' | 'submitted';
  yourAnswer: string;
  correctAnswer?: string;
  explanation: string;
  userText?: string;
  userImageData?: string;
}

function computeFeedback(question: Question, value: Answer['value'], skipped: boolean): FeedbackData {
  if (skipped) {
    return {
      status: 'skipped',
      yourAnswer: 'Skipped',
      explanation: question.explanation || 'No submission recorded. Consider retrying this question.',
    };
  }

  switch (question.type) {
    case 'reading': {
      const selectedId = typeof value === 'string' ? value : '';
      const isCorrect = selectedId === question.correctOptionId;
      const selectedOption = question.options.find(o => o.id === selectedId);
      const correctOption = question.options.find(o => o.id === question.correctOptionId);
      return {
        status: isCorrect ? 'correct' : 'incorrect',
        yourAnswer: selectedOption?.text || 'No answer',
        correctAnswer: correctOption?.text,
        explanation: question.explanation || `The correct answer was option ${question.correctOptionId.toUpperCase()}.`,
      };
    }
    case 'writing-character': {
      const hasDrawing = value && typeof value === 'object' && 'imageData' in value && (value as any).imageData;
      return {
        status: hasDrawing ? 'submitted' : 'incorrect',
        yourAnswer: hasDrawing ? 'Character drawn' : 'No drawing',
        correctAnswer: `${question.character} (${question.pinyin}) — ${question.meaning}`,
        explanation: question.explanation || `The correct character is ${question.character} (${question.pinyin}), meaning "${question.meaning}".`,
        userImageData: hasDrawing ? (value as any).imageData : '',
      };
    }
    case 'speaking': {
      return {
        status: 'submitted',
        yourAnswer: 'Spoken response recorded',
        explanation: question.explanation || (question.tips && question.tips.length > 0 ? question.tips[0] : 'Review the prompt and try again.'),
      };
    }
    case 'writing-essay': {
      const text = value && typeof value === 'object' && 'text' in value ? (value as any).text : '';
      const charCount = text.length;
      return {
        status: charCount >= question.minChars ? 'submitted' : 'incorrect',
        yourAnswer: `${charCount} characters`,
        explanation: question.explanation || `A strong essay should be ${question.minChars}–${question.maxChars} characters and include all requirements.`,
        userText: text,
      };
    }
    default:
      return {
        status: 'submitted',
        yourAnswer: String(value ?? '—'),
        explanation: (question as any).explanation || 'Review the material and try again.',
      };
  }
}

export default function SessionExecution() {
  const { currentSession, submitAnswer, completeSession, setCurrentView, setSessionStatus } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswer, setLocalAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [canvasData, setCanvasData] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [phase, setPhase] = useState<Phase>('summary');
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    if (currentSession?.status === 'ready') {
      setSessionStatus('active');
    }
  }, [currentSession?.status, setSessionStatus]);

  // Reset all local state when a new session starts
  useEffect(() => {
    if (currentSession) {
      setCurrentIndex(0);
      setLocalAnswer('');
      setIsRecording(false);
      setShowHint(false);
      setCanvasData('');
      setSessionComplete(false);
      setPhase('summary');
      setFeedback(null);
    }
  }, [currentSession?.id]);

  if (!currentSession || currentSession.questions.length === 0) {
    return (
      <div className="animate-fade-in-up text-center py-24">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-h2 mb-2">No Active Session</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Generate a new session from the Session Generator.
        </p>
        <button
          onClick={() => setCurrentView('generator')}
          className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Create New Session
        </button>
      </div>
    );
  }

  if (sessionComplete || phase === 'complete') {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center py-24">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-h2 mb-2">Session Complete!</h2>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Great job finishing Review Session #{currentSession.number}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('report')}
            className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            View Report
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-6 py-3 rounded-full text-button transition-all duration-200 hover:scale-[1.02]"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return <SessionSummary session={currentSession} onStart={() => setPhase('question')} />;
  }

  const question = currentSession.questions[currentIndex];

  // Defensive: if question is missing (shouldn't happen, but prevents crash)
  if (!question) {
    return (
      <div className="animate-fade-in-up text-center py-24">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-h2 mb-2">Question Not Found</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Something went wrong loading this question. Try going back to the dashboard.
        </p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalQuestions = currentSession.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const answeredCount = currentSession.answers.filter(a => !a.skipped).length;
  const isFeedback = phase === 'feedback';

  const handleSubmit = () => {
    if (!question) return;

    let value: Answer['value'] = localAnswer;
    if (question.type === 'writing-character') {
      value = { imageData: canvasData };
    } else if (question.type === 'speaking') {
      value = { audioBlob: null };
    } else if (question.type === 'writing-essay') {
      value = { text: localAnswer };
    }

    submitAnswer(question.id, value, false);
    const fb = computeFeedback(question, value, false);
    setFeedback(fb);
    setPhase('feedback');
  };

  const handleSkip = () => {
    if (!question) return;
    submitAnswer(question.id, null, true);
    const fb = computeFeedback(question, null, true);
    setFeedback(fb);
    setPhase('feedback');
  };

  const handleContinue = () => {
    setLocalAnswer('');
    setCanvasData('');
    setShowHint(false);
    setFeedback(null);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setPhase('question');
    } else {
      completeSession();
      setSessionComplete(true);
      setPhase('complete');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLocalAnswer('');
      setCanvasData('');
      setShowHint(false);
      setFeedback(null);
      setPhase('question');
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 896, margin: '0 auto', width: '100%' }}>
      {/* Session Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-h2">📝 Review Session #{currentSession.number}</h1>
            <p className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
              Question {currentIndex + 1} of {totalQuestions} • {answeredCount} answered
            </p>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 rounded-full text-caption transition-all duration-200"
            style={{ border: '1px solid var(--color-border)' }}
          >
            Save & Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="px-3 py-1 rounded-full text-caption font-medium"
            style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
          >
            {getSectionLabel(question.type)}
          </span>
        </div>

        <h3 className={`text-h3 mb-4 ${isFeedback ? 'opacity-70' : ''}`}>{question.prompt}</h3>

        {question.instructions && (
          <p className={`text-body-small mb-6 ${isFeedback ? 'opacity-70' : ''}`} style={{ color: 'var(--color-text-secondary)' }}>
            {question.instructions}
          </p>
        )}

        {/* Question Type Specific UI */}
        {question.type === 'speaking' && (
          <SpeakingQuestionUI
            question={question}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            readOnly={isFeedback}
          />
        )}

        {question.type === 'reading' && (
          <ReadingQuestionUI
            question={question}
            localAnswer={localAnswer}
            setLocalAnswer={setLocalAnswer}
            readOnly={isFeedback}
          />
        )}

        {question.type === 'writing-character' && (
          <WritingCharacterUI
            question={question}
            canvasRef={canvasRef}
            canvasData={canvasData}
            setCanvasData={setCanvasData}
            showHint={showHint}
            setShowHint={setShowHint}
            existingAnswer={currentSession.answers.find(a => a.questionId === question.id)}
            readOnly={isFeedback}
          />
        )}

        {question.type === 'writing-essay' && (
          <WritingEssayUI
            question={question}
            localAnswer={localAnswer}
            setLocalAnswer={setLocalAnswer}
            readOnly={isFeedback}
          />
        )}

        {/* Source Day Footer */}
        <div className="mt-6 pt-4 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {question.sourceDay !== undefined && <>📅 Day {question.sourceDay} • </>}
            {question.section}
          </span>
        </div>
      </div>

      {/* Feedback Card */}
      {isFeedback && feedback && (
        <FeedbackCard feedback={feedback} question={question} onContinue={handleContinue} isLast={currentIndex === totalQuestions - 1} />
      )}

      {/* Navigation Buttons */}
      {!isFeedback && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-button transition-all duration-200 disabled:opacity-30"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-button transition-all duration-200 hover:scale-[1.02]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <SkipForward size={16} /> Skip
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <CheckCircle size={16} />
              {currentIndex === totalQuestions - 1 ? 'Finish' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSectionLabel(type: Question['type']): string {
  const labels: Record<string, string> = {
    speaking: '🎤 Speaking',
    reading: '📖 Reading',
    'writing-character': '✍️ Character Writing',
    'writing-essay': '📝 Essay',
  };
  return labels[type] || 'Question';
}

function SessionSummary({ session, onStart }: { session: ReviewSession; onStart: () => void }) {
  const { context } = useAppStore();
  const config = session.config;
  const moduleTitle = CURRICULUM_MODULES.find(m => m.id === config.moduleId)?.title || `Module ${config.moduleId}`;

  const selectedMasters = context?.master.files.filter(f => config.selectedMasters.includes(f.path)) || [];
  const selectedDays = context?.supporting.days.filter(d => config.selectedDays.includes(d.dayNumber)) || [];

  const skillCounts = [
    { key: 'speaking', label: 'Speaking', count: session.questions.filter((q: Question) => q.type === 'speaking').length, icon: <Mic size={16} /> },
    { key: 'reading', label: 'Reading', count: session.questions.filter((q: Question) => q.type === 'reading').length, icon: <BookText size={16} /> },
    { key: 'writing-character', label: 'Character Writing', count: session.questions.filter((q: Question) => q.type === 'writing-character').length, icon: <PenTool size={16} /> },
    { key: 'writing-essay', label: 'Essay', count: session.questions.filter((q: Question) => q.type === 'writing-essay').length, icon: <BookOpen size={16} /> },
  ].filter(s => s.count > 0);

  const estimatedMinutes = Math.round(session.questions.length * 3.5);

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 768, margin: '0 auto', width: '100%' }}>
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-h1 mb-2">Review Session #{session.number}</h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Quick summary before you begin
        </p>
      </div>

      {/* Module & Config */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="text-body-small font-medium mb-4">📋 Session Configuration</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Module" value={`${moduleTitle}`} />
          <InfoRow label="Difficulty" value={config.difficulty} />
          <InfoRow label="Focus" value={config.focusArea} />
          <InfoRow label="Strictness" value={config.aiStrictness} />
        </div>
      </div>

      {/* Materials */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="text-body-small font-medium mb-4">📂 Selected Materials</div>

        {selectedMasters.length > 0 && (
          <div className="mb-4">
            <div className="text-caption mb-2" style={{ color: 'var(--color-text-secondary)' }}>Master Files</div>
            <div className="space-y-2">
              {selectedMasters.map(file => (
                <div key={file.path} className="flex items-center gap-2 text-body-small">
                  <BookOpen size={14} style={{ color: 'var(--color-accent)' }} />
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDays.length > 0 && (
          <div>
            <div className="text-caption mb-2" style={{ color: 'var(--color-text-secondary)' }}>Daily Materials ({selectedDays.length} days)</div>
            <div className="flex flex-wrap gap-2">
              {selectedDays.map(day => (
                <span
                  key={day.dayNumber}
                  className="px-3 py-1 rounded-full text-caption"
                  style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
                >
                  {day.name} ({day.files.length} files)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="text-body-small font-medium mb-4">🎯 Skills Being Tested</div>
        <div className="space-y-3">
          {skillCounts.map(skill => (
            <div key={skill.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-body-small">
                <span style={{ color: 'var(--color-accent)' }}>{skill.icon}</span>
                {skill.label}
              </div>
              <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {skill.count} question{skill.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {session.questions.length} total questions • ~{estimatedMinutes} min estimated
          </span>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center">
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-8 py-4 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <CheckCircle size={18} /> Start Quiz
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-caption mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <div className="text-body-small font-medium">{value}</div>
    </div>
  );
}

function FeedbackCard({ feedback, question, onContinue, isLast }: { feedback: FeedbackData; question: Question; onContinue: () => void; isLast: boolean }) {
  const config = {
    correct: { color: 'var(--color-success)', bg: 'var(--color-success-bg)', label: 'Correct ✅', icon: <CheckCircle size={20} /> },
    incorrect: { color: 'var(--color-error)', bg: 'var(--color-error-bg)', label: 'Incorrect ❌', icon: <SkipForward size={20} /> },
    skipped: { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-surface)', label: 'Skipped ⏭️', icon: <SkipForward size={20} /> },
    submitted: { color: 'var(--color-blue)', bg: 'rgba(0,122,255,0.08)', label: 'Submitted 📝', icon: <PenTool size={20} /> },
  }[feedback.status];

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 mb-6 animate-fade-in-up"
      style={{
        backgroundColor: config.bg,
        border: `2px solid ${config.color}`,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span style={{ color: config.color }}>{config.icon}</span>
        <span className="text-h3" style={{ color: config.color }}>{config.label}</span>
      </div>

      <div className="space-y-4 mb-6">
        {/* Reading / Objective: compact summary */}
        {question.type === 'reading' && (
          <>
            <div className="flex items-start gap-2">
              <span className="text-caption font-medium shrink-0" style={{ color: 'var(--color-text-secondary)', minWidth: 100 }}>Your answer:</span>
              <span className="text-body-small">{feedback.yourAnswer}</span>
            </div>
            {feedback.correctAnswer && (
              <div className="flex items-start gap-2">
                <span className="text-caption font-medium shrink-0" style={{ color: 'var(--color-text-secondary)', minWidth: 100 }}>Correct:</span>
                <span className="text-body-small font-medium" style={{ color: 'var(--color-success)' }}>{feedback.correctAnswer}</span>
              </div>
            )}
          </>
        )}

        {/* Essay: show full text + checklist */}
        {question.type === 'writing-essay' && feedback.userText && (
          <div className="space-y-3">
            <div>
              <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>Your essay:</span>
              <div
                className="mt-2 p-4 rounded-xl text-body-small max-h-48 overflow-y-auto"
                style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
              >
                {feedback.userText || <em style={{ color: 'var(--color-text-secondary)' }}>No text submitted.</em>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                {feedback.userText.length} / {question.minChars} min characters
              </span>
              {feedback.userText.length < question.minChars && (
                <span className="text-caption font-medium" style={{ color: 'var(--color-error)' }}>Below minimum</span>
              )}
              {feedback.userText.length > question.maxChars && (
                <span className="text-caption font-medium" style={{ color: 'var(--color-error)' }}>Above maximum</span>
              )}
            </div>
            {question.requirements.length > 0 && (
              <div>
                <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>Self-checklist:</span>
                <ul className="mt-2 space-y-1">
                  {question.requirements.map((req, i) => (
                    <li key={i} className="text-body-small flex items-start gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>☐</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Character: show drawing vs correct */}
        {question.type === 'writing-character' && (
          <div className="space-y-3">
            {feedback.userImageData && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="text-center">
                  <span className="text-caption block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Your drawing</span>
                  <img src={feedback.userImageData} alt="Your character" className="rounded-xl border" style={{ borderColor: 'var(--color-border)', width: 120, height: 120, objectFit: 'contain', backgroundColor: '#fff' }} />
                </div>
                <div className="text-center">
                  <span className="text-caption block mb-2" style={{ color: 'var(--color-text-secondary)' }}>Correct</span>
                  <div className="rounded-xl border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', width: 120, height: 120, backgroundColor: '#fff' }}>
                    <span className="text-display" style={{ color: '#000' }}>{question.character}</span>
                  </div>
                </div>
              </div>
            )}
            {!feedback.userImageData && (
              <div className="text-body-small" style={{ color: 'var(--color-error)' }}>No drawing submitted.</div>
            )}
            <div className="flex items-center gap-4 text-body-small">
              <span><strong>Pinyin:</strong> {question.pinyin}</span>
              <span><strong>Meaning:</strong> {question.meaning}</span>
              <span><strong>Strokes:</strong> {question.strokeCount}</span>
            </div>
            {question.etymology && (
              <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                📖 <strong>Memory aid:</strong> {question.etymology}
              </div>
            )}
          </div>
        )}

        {/* Speaking: self-assessment rubric */}
        {question.type === 'speaking' && (
          <div className="space-y-3">
            <div className="text-body-small">
              <strong>Prompt:</strong> {question.prompt}
            </div>
            {question.rubric && question.rubric.length > 0 && (
              <div>
                <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>Self-assessment checklist:</span>
                <ul className="mt-2 space-y-1">
                  {question.rubric.map((item, i) => (
                    <li key={i} className="text-body-small flex items-start gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>☐</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {question.tips && question.tips.length > 0 && (
              <div>
                <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tips for next time:</span>
                <ul className="mt-2 space-y-1">
                  {question.tips.map((tip, i) => (
                    <li key={i} className="text-body-small flex items-start gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Explanation for all types */}
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>💡 Explanation:</span>
          <p className="text-body-small mt-1">{feedback.explanation}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {isLast ? 'View Results' : 'Continue'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SpeakingQuestionUI({ question, isRecording, setIsRecording, readOnly }: {
  question: Extract<Question, { type: 'speaking' }>;
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  readOnly?: boolean;
}) {
  const [recordedTime, setRecordedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordedTime(t => {
          if (t >= question.maxDuration - 1) {
            setIsRecording(false);
            return question.maxDuration;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, question.maxDuration, setIsRecording]);

  return (
    <div className="space-y-4">
      {/* Recording UI */}
      <div
        className={`flex flex-col items-center gap-4 p-6 rounded-xl ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-h3">
          {Math.floor(recordedTime / 60)}:{(recordedTime % 60).toString().padStart(2, '0')} / {Math.floor(question.maxDuration / 60)}:00
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-100"
                style={{
                  height: isRecording ? `${Math.random() * 32 + 8}px` : '4px',
                  backgroundColor: isRecording ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (isRecording) {
              setIsRecording(false);
            } else {
              setRecordedTime(0);
              setIsRecording(true);
            }
          }}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
          style={{ backgroundColor: isRecording ? 'var(--color-error)' : 'var(--color-accent)' }}
        >
          {isRecording ? <Pause size={28} /> : <Mic size={28} />}
        </button>
        <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
          {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
        </div>
      </div>

      {question.tips && (
        <div className="space-y-2">
          <div className="text-body-small font-medium">💡 Tips</div>
          <ul className="space-y-1">
            {question.tips.map((tip, i) => (
              <li key={i} className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReadingQuestionUI({ question, localAnswer, setLocalAnswer, readOnly }: {
  question: Extract<Question, { type: 'reading' }>;
  localAnswer: string;
  setLocalAnswer: (v: string) => void;
  readOnly?: boolean;
}) {
  const [showPinyin, setShowPinyin] = useState(false);

  return (
    <div className="space-y-4">
      {/* Passage */}
      <div
        className="p-5 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-caption font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            📄 Passage
          </span>
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className="text-caption px-3 py-1 rounded-full transition-all duration-200"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {showPinyin ? 'Hide Pinyin' : 'Show Pinyin'}
          </button>
        </div>
        <p className="text-body leading-relaxed">{question.passage}</p>
        {showPinyin && question.passagePinyin && (
          <p className="text-body-small mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            {question.passagePinyin}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map(opt => (
          <label
            key={opt.id}
            className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${readOnly ? 'pointer-events-none opacity-70' : ''}`}
            style={{
              backgroundColor: localAnswer === opt.id ? 'rgba(255,107,107,0.05)' : 'var(--color-bg-primary)',
              border: localAnswer === opt.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            }}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              value={opt.id}
              checked={localAnswer === opt.id}
              onChange={() => setLocalAnswer(opt.id)}
              disabled={readOnly}
              className="w-5 h-5 accent-pink-500"
            />
            <span className="text-body-small">{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function WritingCharacterUI({ question, canvasRef, canvasData, setCanvasData, showHint, setShowHint, existingAnswer, readOnly }: {
  question: Extract<Question, { type: 'writing-character' }>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasData: string;
  setCanvasData: (v: string) => void;
  showHint: boolean;
  setShowHint: (v: boolean) => void;
  existingAnswer?: Answer;
  readOnly?: boolean;
}) {
  const isDrawingRef = useRef(false);

  // Restore or clear canvas when question changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const savedImage = canvasData || (existingAnswer?.value && typeof existingAnswer.value === 'object' && 'imageData' in existingAnswer.value ? (existingAnswer.value as any).imageData : '');
    if (savedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedImage;
    }

    isDrawingRef.current = false;
  }, [question.id, canvasRef, canvasData, existingAnswer]);

  // Native touch listeners with preventDefault
  useEffect(() => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      isDrawingRef.current = true;
      ctx.beginPath();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
      ctx.stroke();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      setCanvasData(canvas.toDataURL());
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasRef, setCanvasData, readOnly]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCanvasData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasData('');
  };

  return (
    <div className="space-y-4">
      {/* Character Info */}
      <div
        className="p-5 rounded-xl text-center"
        style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-display mb-2">{question.character}</div>
        <div className="flex items-center justify-center gap-4 text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Pinyin: <strong style={{ color: 'var(--color-text-primary)' }}>{question.pinyin}</strong></span>
          <span>Meaning: <strong style={{ color: 'var(--color-text-primary)' }}>{question.meaning}</strong></span>
          <span>Strokes: <strong style={{ color: 'var(--color-text-primary)' }}>{question.strokeCount}</strong></span>
        </div>
        {question.etymology && showHint && (
          <div className="mt-3 text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
            📖 {question.etymology}
          </div>
        )}
        {question.etymology && !readOnly && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="mt-2 text-caption transition-colors duration-200"
            style={{ color: 'var(--color-accent)' }}
          >
            {showHint ? 'Hide Etymology' : '👁️ Show Etymology'}
          </button>
        )}
      </div>

      {/* Drawing Canvas */}
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-body-small font-medium mb-3">📝 Your Answer — Draw the character</div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`rounded-lg cursor-crosshair ${readOnly ? 'pointer-events-none' : ''}`}
            style={{
              backgroundColor: '#FFFFFF',
              backgroundImage: `
                linear-gradient(to right, #E5E5EA 1px, transparent 1px),
                linear-gradient(to bottom, #E5E5EA 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              border: '2px solid #D1D1D6',
              touchAction: 'none',
            }}
          />
        </div>
        {!readOnly && (
          <div className="flex justify-center mt-3">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 rounded-full text-caption transition-all duration-200"
              style={{ border: '1px solid var(--color-border)' }}
            >
              🗑️ Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WritingEssayUI({ question, localAnswer, setLocalAnswer, readOnly }: {
  question: Extract<Question, { type: 'writing-essay' }>;
  localAnswer: string;
  setLocalAnswer: (v: string) => void;
  readOnly?: boolean;
}) {
  const charCount = localAnswer.length;
  const minMet = charCount >= question.minChars;
  const maxExceeded = charCount > question.maxChars;

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-body-small font-medium mb-2">Topic</div>
        <p className="text-body">{question.topic} ({question.minChars}–{question.maxChars} characters)</p>
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <div className="text-body-small font-medium">Requirements</div>
        <ul className="space-y-1">
          {question.requirements.map((req, i) => (
            <li key={i} className="text-body-small flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span>•</span> {req}
            </li>
          ))}
        </ul>
      </div>

      {/* Template */}
      {question.template && (
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: 'var(--color-accent-bg)' }}
        >
          <div className="text-caption font-medium mb-1" style={{ color: 'var(--color-accent)' }}>Template</div>
          <p className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>{question.template}</p>
        </div>
      )}

      {/* Editor */}
      <div>
        <textarea
          value={localAnswer}
          onChange={(e) => setLocalAnswer(e.target.value)}
          placeholder="Start writing your essay here..."
          disabled={readOnly}
          className={`w-full p-4 rounded-xl text-body resize-none ${readOnly ? 'opacity-70' : ''}`}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            minHeight: 200,
            fontFamily: 'inherit',
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-caption" style={{ color: maxExceeded ? 'var(--color-error)' : minMet ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
            {charCount} / {question.minChars} minimum characters
          </span>
          {maxExceeded && (
            <span className="text-caption" style={{ color: 'var(--color-error)' }}>
              Maximum exceeded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
