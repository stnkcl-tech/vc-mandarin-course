import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Mic, BookText, PenTool, Zap } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { generateSessionFromAPI, checkBackendHealth } from '../services/api';
import { CURRICULUM_MODULES } from '../types';
import type { SessionConfig, ContextStructure } from '../types';

export default function SessionGenerator() {
  const { context, createSession, setSessionQuestions, setCurrentView } = useAppStore();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<SessionConfig>({
    selectedMasters: context?.master.files.map(f => f.path) || [],
    selectedDays: context?.supporting.days.map(d => d.dayNumber) || [],
    moduleId: 1,
    includeSpeaking: true,
    includeToneDrills: false,
    includeCharacterRecognition: true,
    includeReadingComprehension: true,
    includeSpeedReading: false,
    includeCharacterWriting: true,
    includeSentenceComposition: true,
    includeShortEssay: true,
    difficulty: 'Beginner',
    timeLimit: 'None',
    focusArea: 'Balanced',
    aiStrictness: 'Normal',
  });

  const updateConfig = useCallback((updates: Partial<SessionConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    createSession(config);

    try {
      // Check backend health first
      const health = await checkBackendHealth();
      if (!health.ai_configured) {
        throw new Error('AI backend is not configured. Please check your API key in _backend/.env');
      }

      // Build available files map from context
      const availableFiles: Record<string, Array<{ name: string; type: string; path: string }>> = {};
      for (const day of context?.supporting.days || []) {
        if (config.selectedDays.includes(day.dayNumber)) {
          availableFiles[day.dayNumber] = day.files.map(f => ({
            name: f.name,
            type: f.type,
            path: f.path,
          }));
        }
      }

      const response = await generateSessionFromAPI(config, config.selectedDays, availableFiles);
      setSessionQuestions(response.questions);
      setCurrentView('session');
    } catch (error) {
      console.error('Failed to generate session from backend:', error);
      alert(`Session generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  }, [config, createSession, setSessionQuestions, setCurrentView, context]);

  if (!context?.valid) {
    return (
      <div className="animate-fade-in-up text-center py-24">
        <div className="text-6xl mb-4">📂</div>
        <h2 className="text-h2 mb-2">Materials Required</h2>
        <p className="text-body mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Please scan your _context folder in the Material Manager first.
        </p>
        <button
          onClick={() => setCurrentView('materials')}
          className="px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Go to Material Manager
        </button>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center py-32">
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '3px solid var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: 'var(--color-accent)' }} />
        </div>
        <h2 className="text-h2 mb-2">Generating Your Session...</h2>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Analyzing materials • Building questions • Preparing session
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 768, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 mb-2">🎯 Generate Review Session</h1>
        <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
          Configure your personalized Mandarin practice session.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-caption font-semibold transition-all duration-200"
              style={{
                backgroundColor: s === step ? 'var(--color-accent)' : s < step ? 'var(--color-success)' : 'var(--color-bg-surface)',
                color: s === step || s < step ? '#fff' : 'var(--color-text-secondary)',
                border: s > step ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {s < step ? <Check size={14} /> : s}
            </div>
            <div
              className="h-1 flex-1 rounded-full transition-all duration-200"
              style={{ backgroundColor: s < step ? 'var(--color-success)' : 'var(--color-border)' }}
            />
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 1 && <Step1Masters config={config} updateConfig={updateConfig} context={context} />}
      {step === 2 && <Step2Days config={config} updateConfig={updateConfig} context={context} />}
      {step === 3 && <Step3Configure config={config} updateConfig={updateConfig} />}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-button transition-all duration-200 disabled:opacity-30"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Zap size={16} /> Generate Session
          </button>
        )}
      </div>
    </div>
  );
}

function Step1Masters({ config, updateConfig, context }: {
  config: SessionConfig;
  updateConfig: (u: Partial<SessionConfig>) => void;
  context: ContextStructure;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-h2">Step 1: Select Master Materials</h2>
      
      <div className="space-y-3">
        {context.master.files.map(file => {
          const isTextbook = file.name.toLowerCase().startsWith('textbook');
          const isWorkbook = file.name.toLowerCase().startsWith('workbook');
          const selected = config.selectedMasters.includes(file.path);
          
          return (
            <label
              key={file.path}
              className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: selected ? 'rgba(255,107,107,0.05)' : 'var(--color-bg-surface)',
                border: selected ? '2px solid var(--color-accent)' : '2px solid transparent',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  const newMasters = e.target.checked
                    ? [...config.selectedMasters, file.path]
                    : config.selectedMasters.filter(p => p !== file.path);
                  updateConfig({ selectedMasters: newMasters });
                }}
                className="mt-1 w-5 h-5 accent-pink-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-body font-medium">{file.name}</span>
                </div>
                <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                  {isTextbook ? 'Primary Textbook' : isWorkbook ? 'Exercise Workbook' : 'Master File'}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* Module Detection */}
      <div
        className="p-5 rounded-2xl"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="text-body-small font-medium mb-3">Curriculum Module</div>
        <select
          value={config.moduleId}
          onChange={(e) => updateConfig({ moduleId: parseInt(e.target.value) })}
          className="w-full p-3 rounded-xl text-body"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {CURRICULUM_MODULES.map(m => (
            <option key={m.id} value={m.id}>
              Module {m.id}: {m.title}
            </option>
          ))}
        </select>
        <div className="text-caption mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Auto-detected based on your materials. You can override if needed.
        </div>
      </div>
    </div>
  );
}

function Step2Days({ config, updateConfig, context }: {
  config: SessionConfig;
  updateConfig: (u: Partial<SessionConfig>) => void;
  context: ContextStructure;
}) {
  const allSelected = config.selectedDays.length === context.supporting.days.length;
  
  const toggleAll = () => {
    updateConfig({
      selectedDays: allSelected ? [] : context.supporting.days.map(d => d.dayNumber),
    });
  };

  const estimatedDuration = (() => {
    const dayCount = config.selectedDays.length;
    const audioMins = dayCount * 5;
    const readingMins = dayCount * 3;
    const writingMins = dayCount * 4;
    return audioMins + readingMins + writingMins;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Step 2: Select Supporting Materials</h2>
        <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
          Est. {estimatedDuration} min session
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleAll}
          className="px-4 py-2 rounded-full text-caption font-medium transition-all duration-200"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {context.supporting.days.map(day => {
          const selected = config.selectedDays.includes(day.dayNumber);
          const isEmpty = day.files.length === 0;
          
          return (
            <label
              key={day.dayNumber}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isEmpty ? 'opacity-50' : ''}`}
              style={{
                backgroundColor: selected ? 'rgba(255,107,107,0.05)' : 'var(--color-bg-surface)',
                border: selected ? '1px solid var(--color-accent)' : '1px solid transparent',
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={isEmpty}
                onChange={(e) => {
                  const newDays = e.target.checked
                    ? [...config.selectedDays, day.dayNumber]
                    : config.selectedDays.filter(d => d !== day.dayNumber);
                  updateConfig({ selectedDays: newDays });
                }}
                className="w-5 h-5 accent-pink-500"
              />
              <div className="flex-1">
                <div className="text-body-small font-medium">{day.name}</div>
                <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
                  {day.files.length} files
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Step3Configure({ config, updateConfig }: {
  config: SessionConfig;
  updateConfig: (u: Partial<SessionConfig>) => void;
}) {
  const sections = [
    {
      icon: <Mic size={20} />,
      title: 'Speaking / Listening',
      items: [
        { key: 'includeSpeaking' as const, label: 'Include speaking prompts', sublabel: 'Record responses to prompts' },
        { key: 'includeToneDrills' as const, label: 'Include tone drills', sublabel: 'Practice tone pairs and sandhi' },
      ],
    },
    {
      icon: <BookText size={20} />,
      title: 'Reading',
      items: [
        { key: 'includeCharacterRecognition' as const, label: 'Include character recognition', sublabel: 'Match characters to meanings' },
        { key: 'includeReadingComprehension' as const, label: 'Include reading comprehension', sublabel: 'Read passages and answer questions' },
        { key: 'includeSpeedReading' as const, label: 'Include speed reading challenge', sublabel: 'Timed reading exercises' },
      ],
    },
    {
      icon: <PenTool size={20} />,
      title: 'Writing',
      items: [
        { key: 'includeCharacterWriting' as const, label: 'Include character writing', sublabel: 'Write characters from memory' },
        { key: 'includeSentenceComposition' as const, label: 'Include sentence composition', sublabel: 'Build sentences using grammar' },
        { key: 'includeShortEssay' as const, label: 'Include short essay', sublabel: 'Write a 150–200 character essay' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Step 3: Configure Review Session</h2>

      {/* Skill Sections */}
      {sections.map(section => (
        <div
          key={section.title}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-accent)' }}>{section.icon}</span>
            <span className="text-body font-medium">{section.title}</span>
          </div>
          <div className="p-4 space-y-3">
            {section.items.map(item => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[item.key] as boolean}
                  onChange={(e) => updateConfig({ [item.key]: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-pink-500"
                />
                <div>
                  <div className="text-body-small font-medium">{item.label}</div>
                  <div className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{item.sublabel}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Advanced Options */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="text-body-small font-medium mb-4">⚙️ Advanced Options</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Difficulty"
            value={config.difficulty}
            options={['Beginner', 'Intermediate', 'Advanced']}
            onChange={(v) => updateConfig({ difficulty: v as typeof config.difficulty })}
          />
          <SelectField
            label="Time Limit"
            value={config.timeLimit}
            options={['None', '30 min', '45 min', '60 min']}
            onChange={(v) => updateConfig({ timeLimit: v as typeof config.timeLimit })}
          />
          <SelectField
            label="Focus Area"
            value={config.focusArea}
            options={['Balanced', 'Speaking-heavy', 'Reading-heavy', 'Writing-heavy', 'Grammar-focus', 'Vocabulary-focus']}
            onChange={(v) => updateConfig({ focusArea: v as typeof config.focusArea })}
          />
          <SelectField
            label="AI Strictness"
            value={config.aiStrictness}
            options={['Lenient', 'Normal', 'Strict']}
            onChange={(v) => updateConfig({ aiStrictness: v as typeof config.aiStrictness })}
          />
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-caption mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-xl text-body-small"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
