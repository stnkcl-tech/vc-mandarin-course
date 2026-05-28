# Dev Mistakes Log — Mandarin Mastery Review System

> Documenting bugs, root causes, and fixes so they are not repeated.
> **Read this file before making any build-level or layout changes.**

---

## Table of Contents
1. [Tailwind v4 Theme Token Conflicts](#m1)
2. [Flexbox Auto-Margin Collapse](#m2)
3. [Case-Sensitive / Position-Sensitive String Matching](#m3)
4. [Browser API Compatibility (File System Access API)](#m4)
5. [Canvas Drawing Performance & State Management](#m5)
6. [ReportViewer Runtime Crashes on Missing Data](#m6)

---

## <a name="m1"></a> Mistake #1: Tailwind v4 Theme Token Conflicts

### Symptom
All pages with `max-w-3xl` / `max-w-4xl` collapsed into a super narrow column (~64px wide). Text wrapped one word per line. Cards and buttons were unusable.

### Root Cause
The `@theme` block in `src/index.css` defined custom spacing tokens using the `--spacing-*` CSS custom property namespace:

```css
@theme {
  --spacing-3xl: 64px;   /* ❌ Conflicts with Tailwind's spacing scale */
  --spacing-4xl: 96px;   /* ❌ Conflicts with Tailwind's spacing scale */
}
```

Tailwind v4 uses the `--spacing-*` namespace for its **entire spacing scale** (margins, paddings, max-widths, etc.). Overriding `--spacing-3xl` changed `max-w-3xl` from the default `768px` to `64px`.

### Fix
Rename custom tokens to use a non-conflicting namespace (`--space-*` instead of `--spacing-*`):

```css
@theme {
  --space-3xl: 64px;   /* ✅ Safe — does not conflict */
  --space-4xl: 96px;   /* ✅ Safe — does not conflict */
}
```

Additionally, replace all `max-w-* mx-auto` Tailwind utility pairs with explicit inline styles to eliminate dependency on Tailwind's spacing scale for layout widths:

```tsx
// ❌ Before — relies on Tailwind spacing scale
<div className="max-w-3xl mx-auto">

// ✅ After — explicit, deterministic
<div style={{ maxWidth: 768, margin: '0 auto', width: '100%' }}>
```

### Prevention Checklist
- [ ] Never define `--spacing-*` tokens in `@theme` unless intentionally overriding Tailwind defaults
- [ ] Never define `--color-*` tokens in `@theme` unless intentionally overriding Tailwind defaults
- [ ] For custom design tokens, use project-specific prefixes (e.g., `--space-*`, `--ds-*`, `--mm-*`)
- [ ] After adding any `@theme` token, grep generated CSS for affected utilities to verify no unintended overrides

---

## <a name="m2"></a> Mistake #2: Flexbox Auto-Margin Collapse

### Symptom
Page content rendered in a hairline vertical column. All text, cards, and buttons were squeezed to minimum content width.

### Root Cause
The root app container used `display: flex; flex-direction: column`, and the `main` content area had `margin: 0 auto` for horizontal centering:

```tsx
// ❌ Before — flex item + auto margin = cross-axis shrink
<div className="min-h-screen flex flex-col">
  <Navigation />
  <main className="flex-1" style={{ maxWidth: 1200, margin: '0 auto' }}>
    {children}
  </main>
</div>
```

In CSS flexbox, when a flex item has `margin: auto` on the cross-axis (horizontal, in a column flex container), it **loses `align-self: stretch`** and shrinks to fit its content width.

### Fix
Remove `flex flex-col` from the root container. Use a standard block layout with a centered inner wrapper:

```tsx
// ✅ After — block layout, no flex shrinkage
<div className="min-h-screen">
  <Navigation />
  <main style={{ padding: '24px 24px 64px' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {children}
    </div>
  </main>
</div>
```

### Prevention Checklist
- [ ] Never put `margin: 0 auto` on a flex item inside a flex container
- [ ] If centering is needed inside flex, use `justify-content: center` on the parent or wrap in a non-flex container
- [ ] When using `maxWidth` + `margin: auto` for centering, ensure the element is a normal block element, not a flex item

---

## <a name="m3"></a> Mistake #3: Case-Sensitive / Position-Sensitive String Matching

### Symptom
Dashboard showed "Master Textbook: Not found" and "Workbook: Not found" even though files like `初级上 (Textbook Sesi 1).pdf` existed in the `master/` folder.

### Root Cause
File detection used `.startsWith()` with a lowercase prefix:

```ts
// ❌ Before — case-sensitive and position-sensitive
result.master.textbook = masterFiles.find(f =>
  f.name.toLowerCase().startsWith('textbook')
);
```

The actual filenames have "Textbook" (capital T) in the **middle** of the filename (e.g., `初级上 (Textbook Sesi 1).pdf`), not at the start.

### Fix
Use `.includes()` instead of `.startsWith()` for substring matching, and ensure all comparisons are case-normalized:

```ts
// ✅ After — case-insensitive substring match
result.master.textbook = masterFiles.find(f =>
  f.name.toLowerCase().includes('textbook')
);
```

### Prevention Checklist
- [ ] When matching filenames, always consider: case variations, word order, special characters (Chinese, spaces, parentheses)
- [ ] Prefer `.includes()` over `.startsWith()` / `.endsWith()` unless position is semantically required
- [ ] Always normalize to lowercase before comparison: `name.toLowerCase().includes(...)`
- [ ] When fixing a string-matching bug, search the ENTIRE codebase for the same pattern — the bug often exists in multiple places (e.g., `fileSystem.ts` AND `MaterialManager.tsx` AND `SessionGenerator.tsx`)

---

## <a name="m4"></a> Mistake #4: Browser API Compatibility (File System Access API)

### Symptom
Clicking "Open _context Folder" showed "Folder access was cancelled" error immediately. No folder picker appeared.

### Root Cause
The app relied solely on `window.showDirectoryPicker()`, which is part of the File System Access API. This API is **only available in Chrome and Edge** — Safari and Firefox do not support it.

```ts
// ❌ Before — Chrome/Edge only
const handle = await window.showDirectoryPicker();
```

### Fix
Implement a dual-path approach:

1. **Primary path** (Chrome/Edge): Use `showDirectoryPicker()` for persistent directory access
2. **Fallback path** (Safari/Firefox): Use `<input type="file" webkitdirectory>` for one-time directory upload

```tsx
// ✅ After — cross-browser
function hasFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Chrome/Edge path
async function requestContextAccess(): Promise<boolean> {
  const handle = await window.showDirectoryPicker();
  // ... store handle for persistent access
}

// Safari/Firefox fallback — process FileList from webkitdirectory input
function scanFromFileList(files: FileList): ContextStructure {
  // Parse webkitRelativePath to reconstruct folder structure
}
```

### Prevention Checklist
- [ ] Always check `caniuse.com` or MDN compatibility tables before using non-standard browser APIs
- [ ] Always provide a graceful fallback for unsupported browsers
- [ ] Feature-detect with `'apiName' in window` rather than user-agent sniffing
- [ ] Test in at least Chrome, Safari, and Firefox before declaring a feature complete

---

## General Build Reminders

### Before every build
1. Run `npm run build` and verify zero TypeScript errors
2. Check that `dist/assets/index-*.css` does not contain unexpected utility overrides
3. After fixing a bug in one file, grep for the same buggy pattern across `src/`

### After every build
1. Hard-refresh the browser (Cmd+Shift+R) to clear cached assets
2. Test on at least 2 different viewports (desktop + narrow window)
3. Test the primary user journey end-to-end: Materials → Generate → Session → Report

---

---

## <a name="m5"></a> Mistake #5: Canvas Drawing Performance & State Management

### Symptom
The character writing canvas was completely unresponsive — mouse and trackpad strokes did not appear, or appeared as broken dots. Touch input on tablets scrolled the page instead of drawing. When advancing to the next character-writing question, the previous drawing was still visible on the canvas.

### Root Cause
Four separate but compounding bugs in `WritingCharacterUI` (`SessionExecution.tsx`):

**Bug A: `canvas.toDataURL()` called on every `mousemove`/`touchmove`**

```tsx
// ❌ Before — serializes entire canvas to base64 PNG on every pixel of movement
const draw = (e) => {
  ctx.lineTo(x, y);
  ctx.stroke();
  setCanvasData(canvas.toDataURL()); // 🔥 10–50ms sync call, 60×/sec
};
```

This saturated the main thread and triggered full React re-renders on every pixel, making the canvas appear frozen.

**Bug B: `isDrawing` managed as React state in the parent component**

```tsx
// ❌ Before — lifted to parent state, causing stale closures
const [isDrawing, setIsDrawing] = useState(false); // in SessionExecution

const draw = () => {
  if (!isDrawing) return; // stale closure: still false after setIsDrawing(true)
};
```

When `startDrawing()` called `setIsDrawing(true)`, the batched React update hadn't completed by the time the first `mousemove` fired. The old closure still saw `isDrawing = false`, so initial strokes were silently discarded.

**Bug C: Canvas pixels never cleared between questions**

```tsx
// ❌ Before — only React state was cleared, actual canvas was not
setCanvasData(''); // clears state, not pixels
```

The canvas `2d` context retained the previous drawing across questions.

**Bug D: Touch events did not `preventDefault()`**

React 17+ registers synthetic touch events as **passive by default**, so `e.preventDefault()` is ignored. The `touch-action: none` CSS alone does not reliably prevent page scrolling on iOS Safari.

### Fix

**Fix A: Only serialize on `stopDrawing`**

```tsx
// ✅ After — serialize once at stroke end
const draw = (e) => {
  if (!isDrawingRef.current) return;
  ctx.lineTo(x, y);
  ctx.stroke();
  // NO setCanvasData here
};

const stopDrawing = () => {
  isDrawingRef.current = false;
  setCanvasData(canvas.toDataURL()); // ✅ once per stroke
};
```

**Fix B: Use `useRef` for drawing state**

```tsx
// ✅ After — ref avoids re-renders and stale closures
const isDrawingRef = useRef(false);

const startDrawing = () => {
  isDrawingRef.current = true; // synchronous, no React batching
};
```

**Fix C: Clear canvas via `useEffect` on question change**

```tsx
// ✅ After — clear pixels and restore saved drawing on question change
useEffect(() => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (savedImage) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = savedImage;
  }
}, [question.id]);
```

**Fix D: Native touch listeners with `{ passive: false }`**

```tsx
// ✅ After — native listeners can call preventDefault()
useEffect(() => {
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    // ... start drawing
  };
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  return () => canvas.removeEventListener('touchstart', handleTouchStart);
}, []);
```

### Prevention Checklist
- [ ] Never call `canvas.toDataURL()` inside high-frequency event handlers (mousemove, touchmove, scroll)
- [ ] Never lift transient interaction state (isDrawing, isDragging, isResizing) to parent React state — use `useRef`
- [ ] Always clear `<canvas>` pixels explicitly (`ctx.clearRect`) when the underlying data changes — clearing React state is not enough
- [ ] For touch interactions, always attach native listeners with `{ passive: false }` and call `e.preventDefault()`
- [ ] Add coordinate scaling (`canvas.width / rect.width`) when canvas CSS size differs from bitmap size

---

## <a name="m6"></a> Mistake #6: ReportViewer Runtime Crashes on Missing Data

### Symptom
After clicking "View Report" at the end of a session, the entire screen turned blank (white). The React app completely unmounted. No error boundary caught it.

### Root Cause
Two categories of defensive-coding failures in `ReportViewer.tsx`:

**Bug A: `undefined.slice()` crash on `question.questionText`**

```tsx
// ❌ Before — throws if questionText is undefined
<span>{question.questionText.slice(0, 60)}...</span>
// TypeError: Cannot read properties of undefined (reading 'slice')
```

The AI backend (or mock generator) could theoretically omit the `prompt` field from a question object. `generateReport()` in `helpers.ts` maps `q.prompt` to `questionText`. If `prompt` is missing, `questionText` becomes `undefined`, and `.slice()` crashes the render.

**Bug B: `.map()` on potentially undefined arrays**

```tsx
// ❌ Before — throws if any report array field is missing
{report.skillBreakdown.map(skill => ...)}
{report.insights.map(insight => ...)}
{report.recommendations.map(rec => ...)}
{report.questionReviews.map(q => ...)}
```

If `completeSession()` fails silently or an older report from LocalStorage lacks these fields, `.map()` throws on `undefined`.

### Fix

**Fix A: Optional chaining + fallback for all string operations**

```tsx
// ✅ After — safe even when questionText is undefined
<span>
  {(question.questionText ?? '').slice(0, 60)}
  {question.questionText && question.questionText.length > 60 ? '...' : ''}
</span>
```

**Fix B: Defensive array extraction with `?? []`**

```tsx
// ✅ After — always array, never undefined
const skillBreakdown = report?.skillBreakdown ?? [];
const insights = report?.insights ?? [];
const recommendations = report?.recommendations ?? [];
const questionReviews = report?.questionReviews ?? [];

{skillBreakdown.map(skill => ...)}  // safe
```

### Prevention Checklist
- [ ] Treat ALL data from external sources (AI responses, LocalStorage, APIs) as potentially malformed or partial
- [ ] Never call `.slice()`, `.toLowerCase()`, `.trim()`, etc. on a value without checking it's a string first
- [ ] Never call `.map()`, `.filter()`, `.reduce()` on a value without ensuring it's an array (`?? []`)
- [ ] When accessing nested object properties in JSX/render, use optional chaining (`?.`) or provide explicit fallbacks
- [ ] Consider adding a React Error Boundary at the app root to prevent total unmount on render errors
- [ ] After fixing a crash, grep the codebase for the same unsafe pattern (`.map(` without `?.`, `.slice(` without type guard)

---

## General Build Reminders

### Before every build
1. Run `npm run build` and verify zero TypeScript errors
2. Check that `dist/assets/index-*.css` does not contain unexpected utility overrides
3. After fixing a bug in one file, grep for the same buggy pattern across `src/`

### After every build
1. Hard-refresh the browser (Cmd+Shift+R) to clear cached assets
2. Test on at least 2 different viewports (desktop + narrow window)
3. Test the primary user journey end-to-end: Materials → Generate → Session → Report

---

*Last updated: 2026-05-28*
