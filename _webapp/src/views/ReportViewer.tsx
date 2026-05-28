import { useState } from 'react';
import { Download, Home, Printer, ChevronDown, ChevronUp, CheckCircle, XCircle, SkipForward } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { generateHTMLReport } from '../utils/helpers';
import type { SessionReport } from '../types';

export default function ReportViewer() {
  const { reports, setCurrentView } = useAppStore();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  const report = reports[reports.length - 1];
  
  // Defensive: ensure report arrays exist to prevent crash on malformed data
  const skillBreakdown = report?.skillBreakdown ?? [];
  const insights = report?.insights ?? [];
  const recommendations = report?.recommendations ?? [];
  const questionReviews = report?.questionReviews ?? [];

  if (!report) {
    return (
      <div className="animate-fade-in-up text-center py-24">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-h2 mb-2">No Reports Yet</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Complete a review session to generate your first report.
        </p>
        <button
          onClick={() => setCurrentView('generator')}
          className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Start a Session
        </button>
      </div>
    );
  }

  const toggleQuestion = (id: string) => {
    const newSet = new Set(expandedQuestions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedQuestions(newSet);
  };

  const handleDownload = () => {
    const html = generateHTMLReport(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review_result_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,5).replace(':','')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const scoreColor = report.overallScore >= 80 ? 'var(--color-success)' : 
                     report.overallScore >= 70 ? 'var(--color-warning)' : 'var(--color-error)';
  
  const scoreStatus = report.overallScore >= 90 ? 'Excellent' :
                      report.overallScore >= 80 ? 'Proficient' :
                      report.overallScore >= 70 ? 'Developing' : 'Needs Support';

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 768, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-h1 mb-2">🎓 Review Report</h1>
        <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
          Session #{report.sessionNumber} • {report.date} • Module {report.moduleId}
        </div>
      </div>

      {/* Score Hero */}
      <div className="text-center mb-12">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            border: `12px solid var(--color-border)`,
            borderTopColor: scoreColor,
            transform: 'rotate(-45deg)',
          }}
        >
          <span className="text-display" style={{ transform: 'rotate(45deg)', color: scoreColor }}>
            {report.overallScore}
          </span>
        </div>
        <div className="text-h3" style={{ color: scoreColor }}>
          {scoreStatus}
        </div>
        <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
          Target: 80%+ for Proficient
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="mb-12">
        <h2 className="text-h2 mb-4">📊 Skill Breakdown</h2>
        <div className="space-y-3">
          {skillBreakdown.map(skill => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mb-12">
        <h2 className="text-h2 mb-4">🔍 Performance Insights</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-12">
        <h2 className="text-h2 mb-4">🚀 How to Improve</h2>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={i} index={i} rec={rec} />
          ))}
        </div>
      </div>

      {/* Question Review */}
      <div className="mb-12">
        <h2 className="text-h2 mb-4">📝 Question Review</h2>
        <div className="space-y-2">
          {questionReviews.map(q => (
            <QuestionReviewItem
              key={q.questionId}
              question={q}
              expanded={expandedQuestions.has(q.questionId)}
              onToggle={() => toggleQuestion(q.questionId)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center no-print">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <Download size={16} /> Download HTML
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <Printer size={16} /> Print
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <Home size={16} /> Dashboard
        </button>
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: SessionReport['skillBreakdown'][0] }) {
  const borderColors: Record<string, string> = {
    'Excellent': 'var(--color-success)',
    'Proficient': 'var(--color-blue)',
    'Developing': 'var(--color-warning)',
    'Needs Support': 'var(--color-error)',
  };

  return (
    <div
      className="p-5 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: 'var(--shadow-card)',
        borderLeft: `4px solid ${borderColors[skill.status]}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-body font-medium">{skill.name}</span>
        <span className="text-h3">{skill.score}<span className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>/100</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-600"
          style={{ width: `${skill.score}%`, backgroundColor: borderColors[skill.status] }}
        />
      </div>
      <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
        {skill.status === 'Excellent' ? '✅' : skill.status === 'Proficient' ? '✅' : skill.status === 'Developing' ? '🟡' : '🔴'} {skill.status} — {skill.note}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: SessionReport['insights'][0] }) {
  const borderColors = {
    strength: 'var(--color-success)',
    weakness: 'var(--color-warning)',
    pattern: 'var(--color-text-secondary)',
  };

  const icons = {
    strength: '💪',
    weakness: '🎯',
    pattern: '📈',
  };

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: 'var(--shadow-card)',
        borderLeft: `4px solid ${borderColors[insight.type]}`,
      }}
    >
      <h3 className="text-h3 mb-3">{icons[insight.type]} {insight.title}</h3>
      <ul className="space-y-2">
        {insight.items.map((item, i) => (
          <li key={i} className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationCard({ index, rec }: { index: number; rec: SessionReport['recommendations'][0] }) {
  const priorityColors = {
    high: { border: 'var(--color-error)', bg: 'var(--color-error-bg)' },
    medium: { border: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    low: { border: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: 'var(--shadow-card)',
        borderLeft: `4px solid ${priorityColors[rec.priority].border}`,
      }}
    >
      <div
        className="inline-block px-3 py-1 rounded-full text-caption font-semibold mb-3"
        style={{ backgroundColor: priorityColors[rec.priority].bg, color: priorityColors[rec.priority].border }}
      >
        {priorityIcons[rec.priority]} {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
      </div>
      <h3 className="text-h3 mb-2">{index + 1}. {rec.title}</h3>
      <div className="space-y-2 text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
        <p><strong style={{ color: 'var(--color-text-primary)' }}>Why:</strong> {rec.why}</p>
        <p><strong style={{ color: 'var(--color-text-primary)' }}>Action:</strong> {rec.action}</p>
        <p><strong style={{ color: 'var(--color-text-primary)' }}>Target:</strong> {rec.target}</p>
      </div>
    </div>
  );
}

function QuestionReviewItem({ question, expanded, onToggle }: {
  question: SessionReport['questionReviews'][0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = {
    correct: { color: 'var(--color-success)', icon: <CheckCircle size={16} />, bg: 'var(--color-success-bg)' },
    incorrect: { color: 'var(--color-error)', icon: <XCircle size={16} />, bg: 'var(--color-error-bg)' },
    skipped: { color: 'var(--color-text-secondary)', icon: <SkipForward size={16} />, bg: 'var(--color-bg-surface)' },
  };

  const config = statusConfig[question.status];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span style={{ color: config.color }}>{config.icon}</span>
          <span className="text-body-small font-medium">{question.questionType}</span>
          <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{(question.questionText ?? '').slice(0, 60)}{question.questionText && question.questionText.length > 60 ? '...' : ''}</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <div className="text-body-small"><strong>Question:</strong> {question.questionText ?? '—'}</div>
          <div className="text-body-small"><strong>Your answer:</strong> {question.yourAnswer ?? '—'}</div>
          {question.correctAnswer && (
            <div className="text-body-small"><strong>Correct answer:</strong> {question.correctAnswer}</div>
          )}
          <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
            {question.explanation ?? ''}
          </div>
        </div>
      )}
    </div>
  );
}
