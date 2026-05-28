import { BookOpen, Mic, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { CURRICULUM_MODULES } from '../types';
import { calculateSkillStatus, getStatusColor } from '../utils/helpers';

export default function Dashboard() {
  const { setCurrentView, sessions, reports, context } = useAppStore();
  
  const latestReport = reports[reports.length - 1];
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length)
    : 0;

  const currentModule = latestReport 
    ? CURRICULUM_MODULES.find(m => m.id === latestReport.moduleId) 
    : CURRICULUM_MODULES[0];

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-h1 mb-2">Welcome back! 👋</h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Ready to practice your Mandarin today? You're making great progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard
          icon={<BookOpen size={20} />}
          label="Sessions Completed"
          value={completedSessions.toString()}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Average Score"
          value={avgScore > 0 ? `${avgScore}%` : '—'}
          color={avgScore >= 80 ? 'var(--color-success)' : avgScore >= 70 ? 'var(--color-warning)' : undefined}
        />
        <StatCard
          icon={<Award size={20} />}
          label="Current Module"
          value={currentModule ? `Module ${currentModule.id}` : '—'}
        />
        <StatCard
          icon={<Mic size={20} />}
          label="Skills Practiced"
          value="4"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-h2 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard
            title="Start New Review Session"
            description="Generate a personalized practice session from your materials."
            icon={<Mic size={24} />}
            onClick={() => setCurrentView('generator')}
            primary
          />
          <ActionCard
            title="Manage Materials"
            description="View and organize your textbooks and daily learning files."
            icon={<BookOpen size={24} />}
            onClick={() => setCurrentView('materials')}
          />
        </div>
      </div>

      {/* Latest Report Preview */}
      {latestReport && (
        <div className="mb-12">
          <h2 className="text-h2 mb-4">Latest Session</h2>
          <div
            className="p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              boxShadow: 'var(--shadow-card)',
            }}
            onClick={() => setCurrentView('history')}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-h3">Session #{latestReport.sessionNumber}</div>
                <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                  {latestReport.date} • Module {latestReport.moduleId}
                </div>
              </div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-display"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: getStatusColor(calculateSkillStatus(latestReport.overallScore)),
                  border: `3px solid ${getStatusColor(calculateSkillStatus(latestReport.overallScore))}`,
                }}
              >
                {latestReport.overallScore}
              </div>
            </div>
            <div className="flex items-center gap-2 text-body-small" style={{ color: 'var(--color-accent)' }}>
              View full report <ArrowRight size={14} />
            </div>
          </div>
        </div>
      )}

      {/* Material Status */}
      <div>
        <h2 className="text-h2 mb-4">Material Status</h2>
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {!context ? (
            <div className="text-center py-8">
              <p className="text-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                No learning materials scanned yet. Open your _context folder to get started.
              </p>
              <button
                onClick={() => setCurrentView('materials')}
                className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Scan Materials
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <StatusRow
                label="Master Textbook"
                status={context.master.textbook ? 'ready' : 'missing'}
                detail={context.master.textbook?.name || 'Not found'}
              />
              <StatusRow
                label="Workbook"
                status={context.master.workbook ? 'ready' : 'warning'}
                detail={context.master.workbook?.name || 'Not found (recommended)'}
              />
              <StatusRow
                label="Daily Materials"
                status={context.supporting.days.length > 0 ? 'ready' : 'warning'}
                detail={`${context.supporting.days.length} days found`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div
      className="p-5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: color || 'var(--color-text-secondary)' }}>
        {icon}
        <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      </div>
      <div className="text-h2" style={{ color: color || 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}

function ActionCard({ title, description, icon, onClick, primary }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-6 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] w-full"
      style={{
        backgroundColor: primary ? 'var(--color-accent)' : 'var(--color-bg-surface)',
        color: primary ? '#fff' : 'var(--color-text-primary)',
        boxShadow: primary ? 'var(--shadow-button)' : 'var(--shadow-card)',
      }}
    >
      <div className="mt-1">{icon}</div>
      <div>
        <div className="font-semibold text-body mb-1">{title}</div>
        <div className="text-body-small" style={{ opacity: primary ? 0.9 : 0.7 }}>{description}</div>
      </div>
    </button>
  );
}

function StatusRow({ label, status, detail }: { label: string; status: 'ready' | 'missing' | 'warning'; detail: string }) {
  const colors = {
    ready: 'var(--color-success)',
    missing: 'var(--color-error)',
    warning: 'var(--color-warning)',
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[status] }} />
        <span className="text-body-small">{label}</span>
      </div>
      <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{detail}</span>
    </div>
  );
}
