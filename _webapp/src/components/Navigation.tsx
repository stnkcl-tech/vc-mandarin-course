import { useState, useRef, useEffect } from 'react';
import { BookOpen, Home, History, Mic, Monitor, Sun, Moon, Smartphone } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
  oled: Smartphone,
};

const themeLabels: Record<string, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  oled: 'OLED',
};

export default function Navigation() {
  const { currentView, setCurrentView, theme, setTheme } = useAppStore();
  const [themeOpen, setThemeOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'materials' as const, label: 'Materials', icon: BookOpen },
    { id: 'generator' as const, label: 'New Session', icon: Mic },
    { id: 'history' as const, label: 'History', icon: History },
  ];

  const ThemeIcon = themeIcons[theme];

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: 'rgba(var(--color-bg-primary), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64 }}>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 font-semibold text-h3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span style={{ color: 'var(--color-accent)' }}>🀄</span>
          <span className="hidden sm:inline">Mandarin Mastery</span>
        </button>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200"
                style={{
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-accent-bg)' : 'transparent',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <Icon size={18} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Theme Toggle */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-200 ml-1"
              style={{
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                fontSize: 13,
                fontWeight: 500,
              }}
              title={`Theme: ${themeLabels[theme]}`}
            >
              <ThemeIcon size={16} />
              <span className="hidden lg:inline">{themeLabels[theme]}</span>
            </button>

            {themeOpen && (
              <div
                className="absolute right-0 top-full mt-2 py-2 rounded-2xl overflow-hidden z-50"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-elevated)',
                  minWidth: 160,
                }}
              >
                {(Object.keys(themeIcons) as Array<keyof typeof themeIcons>).map((t) => {
                  const TIcon = themeIcons[t];
                  const active = theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setThemeOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors duration-150"
                      style={{
                        color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
                        backgroundColor: active ? 'var(--color-accent-bg)' : 'transparent',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      <TIcon size={16} />
                      {themeLabels[t]}
                      {active && <span className="ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
