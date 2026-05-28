import { useState, useCallback, useRef } from 'react';
import { FolderOpen, RefreshCw, FileText, Music, Image, Video, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { scanContextWithHandle, requestContextAccess, hasFileSystemAccess, scanFromFileList } from '../services/fileSystem';
import type { ContextStructure, ContextFile } from '../types';

export default function MaterialManager() {
  const { context, setContext } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fsApiAvailable = hasFileSystemAccess();

  const handleOpenFolder = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const granted = await requestContextAccess();
      if (!granted) {
        setError('Folder picker was cancelled. Click the button again to retry.');
        setScanning(false);
        return;
      }
      const structure = await scanContextWithHandle();
      setContext(structure);
      if (!structure.valid) {
        setError(structure.errors.join('\n'));
      }
    } catch (err) {
      setError(`Error accessing folder: ${err}`);
    } finally {
      setScanning(false);
    }
  }, [setContext]);

  const handleRefresh = useCallback(async () => {
    setScanning(true);
    setError(null);
    try {
      const structure = await scanContextWithHandle();
      setContext(structure);
    } catch (err) {
      setError(`Error refreshing: ${err}`);
    } finally {
      setScanning(false);
    }
  }, [setContext]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError('No folder selected. Please select your _context folder.');
      return;
    }
    setScanning(true);
    setError(null);

    setTimeout(() => {
      const structure = scanFromFileList(files);
      setContext(structure);
      if (!structure.valid) {
        setError(structure.errors.join('\n'));
      }
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 300);
  }, [setContext]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 mb-2">Material Manager</h1>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your textbooks, workbooks, and daily learning materials.
          </p>
        </div>
        <div className="flex gap-2">
          {fsApiAvailable ? (
            <button
              onClick={handleOpenFolder}
              disabled={scanning}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <FolderOpen size={16} />
              {context ? 'Change Folder' : 'Open _context Folder'}
            </button>
          ) : (
            <label
              className="flex items-center gap-2 px-5 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <FolderOpen size={16} />
              {scanning ? 'Scanning...' : context ? 'Change Folder' : 'Select _context Folder'}
              <input
                ref={fileInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
            </label>
          )}

          {context && fsApiAvailable && (
            <button
              onClick={handleRefresh}
              disabled={scanning}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-button transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {!fsApiAvailable && !context && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ backgroundColor: 'var(--color-accent-bg)' }}
        >
          <Info size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
          <div className="text-body-small" style={{ color: 'var(--color-text-secondary)' }}>
            Your browser uses the folder upload method. Click <strong style={{ color: 'var(--color-text-primary)' }}>"Select _context Folder"</strong> and choose your <code>_context</code> folder. All files stay on your device.
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div className="text-body-small whitespace-pre-line">{error}</div>
        </div>
      )}

      {!context ? (
        <EmptyState
          fsApiAvailable={fsApiAvailable}
          onOpenFolder={handleOpenFolder}
          onFileInputChange={handleFileInputChange}
          fileInputRef={fileInputRef}
          scanning={scanning}
        />
      ) : (
        <MaterialTree structure={context} />
      )}
    </div>
  );
}

function EmptyState({
  fsApiAvailable,
  onOpenFolder,
  onFileInputChange,
  fileInputRef,
  scanning,
}: {
  fsApiAvailable: boolean;
  onOpenFolder: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  scanning: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 rounded-2xl"
      style={{ backgroundColor: 'var(--color-bg-surface)' }}
    >
      <div className="mb-5">
        <FolderOpen size={56} strokeWidth={1.2} style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
      </div>
      <h3 className="text-h2 mb-3">No Materials Scanned</h3>
      <p className="text-body text-center mb-8" style={{ color: 'var(--color-text-secondary)', maxWidth: 480, lineHeight: 1.6 }}>
        To get started, select your <code style={{ background: 'var(--color-bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' }}>_context</code> folder.
        It should contain a <code style={{ background: 'var(--color-bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' }}>master/</code> directory
        with your textbook and workbook, and a <code style={{ background: 'var(--color-bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' }}>supporting/</code> directory with daily materials.
      </p>

      {fsApiAvailable ? (
        <button
          onClick={onOpenFolder}
          disabled={scanning}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <FolderOpen size={16} />
          {scanning ? 'Scanning...' : 'Open _context Folder'}
        </button>
      ) : (
        <label
          className="flex items-center gap-2 px-6 py-3 rounded-full text-button text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          <FolderOpen size={16} />
          {scanning ? 'Scanning...' : 'Select _context Folder'}
          <input
            ref={fileInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
        </label>
      )}
    </div>
  );
}

function MaterialTree({ structure }: { structure: ContextStructure }) {
  return (
    <div className="space-y-6">
      <FolderSection
        title="master/"
        subtitle="Primary textbook and workbook"
        valid={structure.master.exists && !!structure.master.textbook}
      >
        {structure.master.files.length === 0 ? (
          <div className="text-body-small py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No files found in master/
          </div>
        ) : (
          <div className="space-y-2">
            {structure.master.files.map(file => (
              <FileRow key={file.path} file={file} isTextbook={file.name.toLowerCase().includes('textbook')} isWorkbook={file.name.toLowerCase().includes('workbook')} />
            ))}
          </div>
        )}
      </FolderSection>

      <FolderSection
        title="supporting/"
        subtitle={`${structure.supporting.days.length} day folders found`}
        valid={structure.supporting.exists}
      >
        {structure.supporting.days.length === 0 ? (
          <div className="text-body-small py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            No day folders found in supporting/
          </div>
        ) : (
          <div className="space-y-3">
            {structure.supporting.days.map(day => (
              <DayFolderRow key={day.dayNumber} day={day} />
            ))}
          </div>
        )}
      </FolderSection>
    </div>
  );
}

function FolderSection({ title, subtitle, valid, children }: {
  title: string;
  subtitle: string;
  valid: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-h3">{title}</span>
            {valid ? (
              <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
            ) : (
              <AlertCircle size={18} style={{ color: 'var(--color-error)' }} />
            )}
          </div>
          <div className="text-caption mt-1" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FileRow({ file, isTextbook, isWorkbook }: { file: ContextFile; isTextbook?: boolean; isWorkbook?: boolean }) {
  const icons = {
    pdf: <FileText size={18} />,
    docx: <FileText size={18} />,
    txt: <FileText size={18} />,
    epub: <FileText size={18} />,
    audio: <Music size={18} />,
    image: <Image size={18} />,
    video: <Video size={18} />,
    other: <FileText size={18} />,
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200"
      style={{
        backgroundColor: isTextbook || isWorkbook ? 'rgba(255,107,107,0.05)' : 'transparent',
      }}
    >
      <span style={{ color: 'var(--color-text-secondary)' }}>{icons[file.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="text-body-small truncate">{file.name}</div>
        {(isTextbook || isWorkbook) && (
          <div className="text-caption" style={{ color: 'var(--color-accent)' }}>
            {isTextbook ? 'Primary Textbook' : 'Exercise Workbook'}
          </div>
        )}
      </div>
      <div className="text-caption flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
        {formatSize(file.size)}
      </div>
    </div>
  );
}

function DayFolderRow({ day }: { day: { dayNumber: number; name: string; files: ContextFile[] } }) {
  const [expanded, setExpanded] = useState(false);

  const audioCount = day.files.filter(f => f.type === 'audio').length;
  const docCount = day.files.filter(f => ['pdf', 'docx', 'txt', 'epub'].includes(f.type)).length;
  const imageCount = day.files.filter(f => f.type === 'image').length;
  const videoCount = day.files.filter(f => f.type === 'video').length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors duration-200"
        style={{ backgroundColor: expanded ? 'var(--color-hover-surface)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-body-small font-medium">{day.name}</span>
          <span className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>
            {day.files.length} files
          </span>
        </div>
        <div className="flex items-center gap-2">
          {audioCount > 0 && <span className="text-caption">🎵 {audioCount}</span>}
          {docCount > 0 && <span className="text-caption">📄 {docCount}</span>}
          {imageCount > 0 && <span className="text-caption">🖼️ {imageCount}</span>}
          {videoCount > 0 && <span className="text-caption">🎬 {videoCount}</span>}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          {day.files.map(file => (
            <FileRow key={file.path} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
