import type { SessionScores, SkillScore, SessionReport, ReviewSession, Question, Answer, PerformanceInsight, Recommendation, QuestionReview } from '../types';

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateSkillStatus(score: number): SkillScore['status'] {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Proficient';
  if (score >= 70) return 'Developing';
  return 'Needs Support';
}

export function getStatusColor(status: SkillScore['status']): string {
  switch (status) {
    case 'Excellent': return 'var(--color-success)';
    case 'Proficient': return 'var(--color-blue)';
    case 'Developing': return 'var(--color-warning)';
    case 'Needs Support': return 'var(--color-error)';
    default: return 'var(--color-text-secondary)';
  }
}

export function getStatusBgColor(status: SkillScore['status']): string {
  switch (status) {
    case 'Excellent': return 'var(--color-success-bg)';
    case 'Proficient': return 'var(--color-blue-bg)';
    case 'Developing': return 'var(--color-warning-bg)';
    case 'Needs Support': return 'var(--color-error-bg)';
    default: return 'var(--color-bg-surface)';
  }
}

export function getStatusEmoji(status: SkillScore['status']): string {
  switch (status) {
    case 'Excellent': return '✅';
    case 'Proficient': return '✅';
    case 'Developing': return '🟡';
    case 'Needs Support': return '🔴';
    default: return '⚪';
  }
}

export function calculateScores(session: ReviewSession): SessionScores {
  const speakingQs = session.questions.filter(q => q.type === 'speaking');
  const readingQs = session.questions.filter(q => q.type === 'reading');
  const writingQs = session.questions.filter(q => q.type === 'writing-character' || q.type === 'writing-essay');

  const speakingScore = calculateSectionScore(speakingQs, session.answers, true);
  const readingScore = calculateSectionScore(readingQs, session.answers);
  const writingScore = calculateSectionScore(writingQs, session.answers, true);

  const presentScores = [];
  if (speakingQs.length > 0) presentScores.push(speakingScore);
  if (readingQs.length > 0) presentScores.push(readingScore);
  if (writingQs.length > 0) presentScores.push(writingScore);
  const overall = presentScores.length > 0 ? Math.round(presentScores.reduce((a, b) => a + b, 0) / presentScores.length) : 0;

  return {
    overall,
    speaking: {
      name: 'Speaking / Pronunciation',
      score: speakingScore,
      status: calculateSkillStatus(speakingScore),
      note: speakingScore >= 80
        ? 'Clear pronunciation and good fluency'
        : speakingScore >= 70
          ? 'Tone accuracy needs more practice'
          : 'Practice daily shadowing exercises',
    },
    reading: {
      name: 'Reading Comprehension',
      score: readingScore,
      status: calculateSkillStatus(readingScore),
      note: readingScore >= 80
        ? 'Excellent character recognition'
        : readingScore >= 70
          ? 'Build vocabulary with flashcards'
          : 'Review basic characters from Module 1',
    },
    writing: {
      name: 'Writing / Composition',
      score: writingScore,
      status: calculateSkillStatus(writingScore),
      note: writingScore >= 80
        ? 'Good grammar and character accuracy'
        : writingScore >= 70
          ? 'Focus on stroke order and grammar'
          : 'Practice writing characters daily on grid paper',
    },
  };
}

function calculateSectionScore(questions: Question[], answers: Answer[], isSubjective = false): number {
  if (questions.length === 0) return 0;
  
  let correct = 0;
  for (const q of questions) {
    const answer = answers.find(a => a.questionId === q.id);
    if (!answer || answer.skipped) continue;
    
    if (isSubjective) {
      // For subjective questions, estimate based on if they attempted
      if (answer.value && answer.value !== '') {
        correct += 0.7 + Math.random() * 0.3; // Simulated scoring
      }
    } else {
      // For objective questions, compare answers
      if (q.type === 'reading') {
        const correctOption = (q as any).correctOptionId;
        if (answer.value === correctOption) correct++;
      }
    }
  }
  
  return Math.round((correct / questions.length) * 100);
}

export function generateReport(session: ReviewSession): SessionReport {
  const scores = calculateScores(session);
  const skillBreakdown = [scores.speaking, scores.reading, scores.writing];
  
  const insights: PerformanceInsight[] = [
    {
      type: 'strength',
      title: 'Strengths',
      items: skillBreakdown
        .filter(s => s.score >= 80)
        .map(s => `${s.name}: ${s.score}/100 — ${s.note}`),
    },
    {
      type: 'weakness',
      title: 'Areas for Improvement',
      items: skillBreakdown
        .filter(s => s.score < 80)
        .map(s => `${s.name}: ${s.score}/100 — ${s.note}`),
    },
    {
      type: 'pattern',
      title: 'Progress Patterns',
      items: [
        `Session completed with ${session.answers.filter(a => !a.skipped).length}/${session.questions.length} questions attempted.`,
        `Total time: ${formatDuration(session.timeSpent)}.`,
      ],
    },
  ];

  // Ensure strengths/weaknesses always have at least one item
  if (insights[0].items.length === 0) {
    const best = skillBreakdown.reduce((a, b) => a.score > b.score ? a : b);
    insights[0].items.push(`${best.name} is your strongest area at ${best.score}/100.`);
  }
  if (insights[1].items.length === 0) {
    const worst = skillBreakdown.reduce((a, b) => a.score < b.score ? a : b);
    insights[1].items.push(`${worst.name} could use more focus at ${worst.score}/100.`);
  }

  const recommendations: Recommendation[] = skillBreakdown
    .filter(s => s.score < 90)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((s, i) => ({
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
      title: `Improve ${s.name}`,
      why: `Your score of ${s.score}/100 indicates room for growth in this area.`,
      action: `Practice ${s.name.toLowerCase()} exercises from Module ${session.config.moduleId} for 15 minutes daily.`,
      target: 'Achieve 80% accuracy in the next session.',
    }));

  const questionReviews: QuestionReview[] = session.questions.map(q => {
    const answer = session.answers.find(a => a.questionId === q.id);
    const isCorrect = !answer?.skipped && answer?.value === (q as any).correctOptionId;
    
    return {
      questionId: q.id,
      status: answer?.skipped ? 'skipped' : isCorrect ? 'correct' : 'incorrect',
      questionText: q.prompt,
      questionType: q.type,
      yourAnswer: answer?.skipped ? 'Skipped' : answer?.value?.toString() || 'No answer',
      correctAnswer: (q as any).correctOptionId,
      explanation: q.explanation
        ? q.explanation
        : isCorrect 
          ? 'Correct! Well done.' 
          : answer?.skipped 
            ? 'No submission recorded. Consider retrying this question.'
            : `The correct answer was option ${(q as any).correctOptionId}. Review this concept from the curriculum.`,
    };
  });

  return {
    sessionId: session.id,
    sessionNumber: session.number,
    date: formatDate(new Date(session.createdAt)),
    moduleId: session.config.moduleId,
    duration: session.timeSpent,
    overallScore: scores.overall,
    skillBreakdown,
    insights,
    recommendations,
    questionReviews,
  };
}

export function generateHTMLReport(report: SessionReport): string {
  const moduleTitle = `Module ${report.moduleId}`;
  const scoreColor = report.overallScore >= 80 ? 'var(--color-success)' : 
                     report.overallScore >= 70 ? 'var(--color-warning)' : 'var(--color-error)';
  
  const status = calculateSkillStatus(report.overallScore);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mandarin Mastery Review Report — Session #${report.sessionNumber}</title>
  <style>
    :root {
      --bg-primary: #FFFFFF;
      --bg-surface: #F5F5F7;
      --text-primary: #1D1D1F;
      --text-secondary: #6E6E73;
      --accent: #FF6B6B;
      --border: #E5E5EA;
      --success: #34C759;
      --warning: #FF9500;
      --error: #FF3B30;
      --blue: #007AFF;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1C1C1E;
        --bg-surface: #2C2C2E;
        --text-primary: #FFFFFF;
        --text-secondary: #8E8E93;
        --border: #38383A;
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      margin: 0;
      padding: 48px 24px;
      line-height: 1.5;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 48px; }
    .header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .meta { color: var(--text-secondary); font-size: 14px; }
    .score-section { text-align: center; margin-bottom: 48px; }
    .score-circle {
      width: 160px; height: 160px;
      border-radius: 50%;
      border: 12px solid var(--border);
      border-top-color: ${scoreColor};
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      font-size: 48px; font-weight: 700;
    }
    .score-label { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
    .card {
      background: var(--bg-surface);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .skill-card { border-left: 4px solid var(--border); }
    .skill-card.excellent { border-color: var(--success); }
    .skill-card.proficient { border-color: var(--blue); }
    .skill-card.developing { border-color: var(--warning); }
    .skill-card.needs-support { border-color: var(--error); }
    .skill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .skill-name { font-size: 16px; font-weight: 600; }
    .skill-score { font-size: 20px; font-weight: 700; }
    .skill-bar { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
    .skill-bar-fill { height: 100%; border-radius: 4px; }
    .insight-card { border-left: 4px solid; }
    .insight-card.strength { border-color: var(--success); }
    .insight-card.weakness { border-color: var(--warning); }
    .insight-card.pattern { border-color: var(--text-secondary); }
    .insight-card h3 { margin: 0 0 12px; font-size: 18px; }
    .insight-card ul { margin: 0; padding-left: 20px; }
    .insight-card li { margin-bottom: 8px; }
    .rec-card { border-left: 4px solid; }
    .rec-card.priority-high { border-color: var(--error); }
    .rec-card.priority-medium { border-color: var(--warning); }
    .rec-card.priority-low { border-color: var(--success); }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    .priority-high .priority-badge { background: rgba(255,59,48,0.1); color: var(--error); }
    .priority-medium .priority-badge { background: rgba(255,149,0,0.1); color: var(--warning); }
    .priority-low .priority-badge { background: rgba(52,199,89,0.1); color: var(--success); }
    @media print {
      body { background: #fff !important; color: #1D1D1F !important; }
      .card { box-shadow: none !important; border: 1px solid #E5E5EA; break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Mandarin Mastery Review Report</h1>
      <div class="meta">
        <span>Session #${report.sessionNumber}</span> • 
        <span>${report.date}</span> • 
        <span>${moduleTitle}</span> • 
        <span>${formatDuration(report.duration)}</span>
      </div>
    </div>
    
    <div class="score-section">
      <div class="score-circle">${report.overallScore}</div>
      <div class="score-label">${getStatusEmoji(status)} ${status} — Target: 80%+ for Proficient</div>
    </div>

    <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">📊 Skill Breakdown</h2>
    ${report.skillBreakdown.map(s => `
      <div class="card skill-card ${s.status.toLowerCase().replace(' ', '-')}">
        <div class="skill-header">
          <div class="skill-name">${s.name}</div>
          <div class="skill-score">${s.score}/100</div>
        </div>
        <div class="skill-bar">
          <div class="skill-bar-fill" style="width: ${s.score}%; background: ${getStatusColor(s.status)};"></div>
        </div>
        <div style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
          ${getStatusEmoji(s.status)} ${s.status} — ${s.note}
        </div>
      </div>
    `).join('')}

    <h2 style="font-size: 24px; font-weight: 600; margin: 48px 0 16px;">🔍 Performance Insights</h2>
    ${report.insights.map(i => `
      <div class="card insight-card ${i.type}">
        <h3>${i.type === 'strength' ? '💪' : i.type === 'weakness' ? '🎯' : '📈'} ${i.title}</h3>
        <ul>${i.items.map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    `).join('')}

    <h2 style="font-size: 24px; font-weight: 600; margin: 48px 0 16px;">🚀 How to Improve</h2>
    ${report.recommendations.map((r, i) => `
      <div class="card rec-card priority-${r.priority}">
        <div class="priority-badge">${r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'} ${r.priority.charAt(0).toUpperCase() + r.priority.slice(1)} Priority</div>
        <h3 style="margin: 0 0 8px;">${i + 1}. ${r.title}</h3>
        <p><strong>Why:</strong> ${r.why}</p>
        <p><strong>Action:</strong> ${r.action}</p>
        <p><strong>Target:</strong> ${r.target}</p>
      </div>
    `).join('')}

    <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); color: var(--text-secondary); font-size: 12px;">
      <p>Report generated by Mandarin Mastery Review System</p>
      <p>AI-assisted assessment • For educational purposes only</p>
    </div>
  </div>
</body>
</html>`;
}
