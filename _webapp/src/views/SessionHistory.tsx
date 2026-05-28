import { Calendar, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { calculateSkillStatus, getStatusColor, getStatusEmoji } from '../utils/helpers';
import { CURRICULUM_MODULES } from '../types';

export default function SessionHistory() {
  const { reports, setCurrentView } = useAppStore();

  if (reports.length === 0) {
    return (
      <div className="animate-fade-in-up text-center py-24">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-h2 mb-2">No Session History</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Complete your first review session to see your progress here.
        </p>
        <button
          onClick={() => setCurrentView('generator')}
          className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Start First Session
        </button>
      </div>
    );
  }

  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length);
  const bestScore = Math.max(...reports.map(r => r.overallScore));
  const totalTime = reports.reduce((sum, r) => sum + r.duration, 0);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-h1 mb-2">📚 Session History</h1>
      <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        Track your Mandarin learning progress over time.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={<TrendingUp size={20} />} label="Average Score" value={`${avgScore}%`} />
        <StatCard icon={<Award size={20} />} label="Best Score" value={`${bestScore}%`} />
        <StatCard icon={<Calendar size={20} />} label="Total Study Time" value={`${Math.floor(totalTime / 60)} min`} />
      </div>

      {/* Score Trend */}
      <div
        className="p-6 rounded-2xl mb-10"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-h2 mb-4">Score Trend</h2>
        <div className="flex items-end gap-2 h-40">
          {reports.map((report) => {
            const height = Math.max(10, (report.overallScore / 100) * 100);
            return (
              <div key={report.sessionId} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    backgroundColor: getStatusColor(calculateSkillStatus(report.overallScore)),
                  }}
                />
                <span className="text-caption">#{report.sessionNumber}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session List */}
      <h2 className="text-h2 mb-4">All Sessions</h2>
      <div className="space-y-3">
        {[...reports].reverse().map(report => {
          const module = CURRICULUM_MODULES.find(m => m.id === report.moduleId);
          const status = calculateSkillStatus(report.overallScore);
          
          return (
            <button
              key={report.sessionId}
              onClick={() => setCurrentView('report')}
              className="flex items-center justify-between w-full p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-body font-bold"
                  style={{
                    color: getStatusColor(status),
                    border: `2px solid ${getStatusColor(status)}`,
                  }}
                >
                  {report.overallScore}
                </div>
                <div>
                  <div className="text-body font-medium">Session #{report.sessionNumber}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                    {report.date} • {module ? `Module ${module.id}` : `Module ${report.moduleId}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-caption" style={{ color: getStatusColor(status) }}>
                  {getStatusEmoji(status)} {status}
                </span>
                <ArrowRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-accent)' }}>
        {icon}
        <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      </div>
      <div className="text-h2">{value}</div>
    </div>
  );
}
