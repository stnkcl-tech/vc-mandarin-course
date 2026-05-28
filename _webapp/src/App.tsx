import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import Dashboard from './views/Dashboard';
import MaterialManager from './views/MaterialManager';
import SessionGenerator from './views/SessionGenerator';
import SessionExecution from './views/SessionExecution';
import ReportViewer from './views/ReportViewer';
import SessionHistory from './views/SessionHistory';
import Navigation from './components/Navigation';

function App() {
  const { currentView, theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-oled');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'oled') {
      root.classList.add('theme-oled');
    } else if (effectiveTheme === 'dark') {
      root.classList.add('theme-dark');
    } else {
      root.classList.add('theme-light');
    }
  }, [theme]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'materials': return <MaterialManager />;
      case 'generator': return <SessionGenerator />;
      case 'session': return <SessionExecution />;
      case 'report': return <ReportViewer />;
      case 'history': return <SessionHistory />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <Navigation />
      <main style={{ padding: '24px 24px 64px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
