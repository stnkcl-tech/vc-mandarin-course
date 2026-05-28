import type { ContextFile, ContextStructure, DayFolder } from '../types';

function getFileType(filename: string): ContextFile['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const docExts = ['pdf', 'docx', 'txt', 'epub'];
  const audioExts = ['mp3', 'm4a', 'wav', 'ogg'];
  const imageExts = ['png', 'jpg', 'jpeg', 'webp'];
  const videoExts = ['mp4', 'mov', 'webm'];

  if (docExts.includes(ext)) return 'pdf';
  if (audioExts.includes(ext)) return 'audio';
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  return 'other';
}

// ───────────────────────────────────────────────────────────────
// File System Access API (Chrome/Edge — persistent access)
// ───────────────────────────────────────────────────────────────

let contextDirectoryHandle: FileSystemDirectoryHandle | null = null;

export function hasFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function requestContextAccess(): Promise<boolean> {
  try {
    // @ts-ignore - File System Access API
    const handle = await window.showDirectoryPicker();
    contextDirectoryHandle = handle;
    return true;
  } catch {
    return false;
  }
}

export async function scanContextWithHandle(): Promise<ContextStructure> {
  const result = createEmptyStructure();

  if (!contextDirectoryHandle) {
    result.errors.push('No directory access granted. Please open the _context folder.');
    result.valid = false;
    return result;
  }

  try {
    const entries: { name: string; kind: string; handle: FileSystemHandle }[] = [];
    // @ts-ignore
    for await (const [name, handle] of contextDirectoryHandle.entries()) {
      entries.push({ name, kind: handle.kind, handle });
    }

    const masterEntry = entries.find(e => e.name.toLowerCase() === 'master');
    const supportingEntry = entries.find(e => e.name.toLowerCase() === 'supporting');

    if (!masterEntry) {
      result.errors.push('master/ folder not found in selected directory.');
      result.valid = false;
    } else {
      result.master.exists = true;
      const masterHandle = masterEntry.handle as FileSystemDirectoryHandle;
      const masterFiles: ContextFile[] = [];
      // @ts-ignore
      for await (const [name, handle] of masterHandle.entries()) {
        if (handle.kind === 'file') {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          masterFiles.push({
            name,
            path: `master/${name}`,
            size: file.size,
            type: getFileType(name),
            lastModified: file.lastModified,
          });
        }
      }
      result.master.files = masterFiles;
      result.master.textbook = masterFiles.find(f => f.name.toLowerCase().includes('textbook'));
      result.master.workbook = masterFiles.find(f => f.name.toLowerCase().includes('workbook'));

      if (!result.master.textbook) {
        result.errors.push('No textbook file found in master/ folder.');
      }
    }

    if (supportingEntry) {
      result.supporting.exists = true;
      const supportingHandle = supportingEntry.handle as FileSystemDirectoryHandle;
      const days: DayFolder[] = [];
      // @ts-ignore
      for await (const [name, handle] of supportingHandle.entries()) {
        if (handle.kind === 'directory') {
          const dayMatch = name.match(/^day\s*(\d+)$/i);
          if (dayMatch) {
            const dayNum = parseInt(dayMatch[1], 10);
            const dayHandle = handle as FileSystemDirectoryHandle;
            const dayFiles: ContextFile[] = [];
            // @ts-ignore
            for await (const [fileName, fileHandle] of dayHandle.entries()) {
              if (fileHandle.kind === 'file') {
                const file = await (fileHandle as FileSystemFileHandle).getFile();
                dayFiles.push({
                  name: fileName,
                  path: `supporting/${name}/${fileName}`,
                  size: file.size,
                  type: getFileType(fileName),
                  lastModified: file.lastModified,
                });
              }
            }
            days.push({ dayNumber: dayNum, name, files: dayFiles });
          }
        }
      }
      days.sort((a, b) => a.dayNumber - b.dayNumber);
      result.supporting.days = days;

      const dayNumbers = days.map(d => d.dayNumber);
      for (let i = 1; i < dayNumbers.length; i++) {
        if (dayNumbers[i] - dayNumbers[i - 1] > 1) {
          result.errors.push(`Day folder gap detected between Day ${dayNumbers[i - 1]} and Day ${dayNumbers[i]}.`);
        }
      }
    }
  } catch (error) {
    result.errors.push(`Scan failed: ${error}`);
    result.valid = false;
  }

  return result;
}

// ───────────────────────────────────────────────────────────────
// Fallback: file input with webkitdirectory (all browsers)
// ───────────────────────────────────────────────────────────────

export function scanFromFileList(files: FileList): ContextStructure {
  const result = createEmptyStructure();

  // Files from webkitdirectory have webkitRelativePath like:
  // "_context/master/textbook.pdf" or "master/textbook.pdf"
  const fileArray = Array.from(files);

  // Detect path prefix (some browsers include the top folder, some don't)
  const hasPrefix = fileArray.some(f => f.webkitRelativePath.startsWith('_context/'));
  const prefix = hasPrefix ? '_context/' : '';

  const masterPrefix = `${prefix}master/`;
  const supportingPrefix = `${prefix}supporting/`;

  // Extract master files
  const masterFiles: ContextFile[] = [];
  for (const file of fileArray) {
    if (file.webkitRelativePath.startsWith(masterPrefix)) {
      const relName = file.webkitRelativePath.slice(masterPrefix.length);
      if (!relName.includes('/')) {
        masterFiles.push({
          name: file.name,
          path: `master/${file.name}`,
          size: file.size,
          type: getFileType(file.name),
          lastModified: file.lastModified,
        });
      }
    }
  }

  if (masterFiles.length > 0) {
    result.master.exists = true;
    result.master.files = masterFiles;
    result.master.textbook = masterFiles.find(f => f.name.toLowerCase().includes('textbook'));
    result.master.workbook = masterFiles.find(f => f.name.toLowerCase().includes('workbook'));

    if (!result.master.textbook) {
      result.errors.push('No textbook file found in master/ folder.');
    }
  } else {
    result.errors.push('master/ folder is missing or empty.');
    result.valid = false;
  }

  // Extract supporting day folders
  const dayMap = new Map<number, ContextFile[]>();
  for (const file of fileArray) {
    if (file.webkitRelativePath.startsWith(supportingPrefix)) {
      const relPath = file.webkitRelativePath.slice(supportingPrefix.length);
      const dayMatch = relPath.match(/^(day\s*\d+)\//i);
      if (dayMatch) {
        const dayNum = parseInt(dayMatch[1].replace(/\D/g, ''), 10);
        if (!dayMap.has(dayNum)) dayMap.set(dayNum, []);
        dayMap.get(dayNum)!.push({
          name: file.name,
          path: `supporting/${dayMatch[1]}/${file.name}`,
          size: file.size,
          type: getFileType(file.name),
          lastModified: file.lastModified,
        });
      }
    }
  }

  if (dayMap.size > 0) {
    result.supporting.exists = true;
    const days: DayFolder[] = [];
    for (const [dayNumber, files] of dayMap) {
      days.push({ dayNumber, name: `Day ${dayNumber}`, files });
    }
    days.sort((a, b) => a.dayNumber - b.dayNumber);
    result.supporting.days = days;

    const dayNumbers = days.map(d => d.dayNumber);
    for (let i = 1; i < dayNumbers.length; i++) {
      if (dayNumbers[i] - dayNumbers[i - 1] > 1) {
        result.errors.push(`Day folder gap detected between Day ${dayNumbers[i - 1]} and Day ${dayNumbers[i]}.`);
      }
    }
  }

  return result;
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function createEmptyStructure(): ContextStructure {
  return {
    valid: true,
    errors: [],
    master: { exists: false, files: [] },
    supporting: { exists: false, days: [] },
  };
}
