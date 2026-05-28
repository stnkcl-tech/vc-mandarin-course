<!-- From: /Users/thagstn/Documents/vc-mandarin-course/AGENTS.md -->
# AGENTS.md — Mandarin Mastery Review System

> This file is written for AI coding agents. It assumes you know nothing about this project.

---

## Project Overview

**Mandarin Mastery Review System** is a web-based, local-first application for remote Mandarin Chinese learners. It allows users to:

1. Upload and organize their own learning materials (textbooks, workbooks, audio, images).
2. Generate structured AI-driven review sessions based on a 12-module curriculum.
3. Complete interactive exercises covering speaking, reading, and writing.
4. Receive scored feedback and actionable improvement recommendations in standalone HTML reports.

**Status:** The application is fully scaffolded and functional. It consists of a React frontend (`_webapp/`) and a Python FastAPI backend (`_backend/`). Core features are implemented including material scanning, AI-powered session generation, session execution, and HTML report generation.

The application is designed to be **local-first** — all files remain on the user's device. There is no cloud database, and all AI calls require explicit API key configuration.

---

## Directory Structure

```
.
├── _context/                 # Learning materials (user-provided content)
│   ├── master/               # Primary textbook and workbook PDFs
│   └── supporting/           # Daily learning materials organized by day
│       ├── Day 1/
│       ├── Day 2/
│       └── ... (Day 3–Day 24 currently present)
│
├── _instructions/            # Authoritative project specifications (READ THESE)
│   ├── design-reference.md   # UI/UX design system (colors, typography, components)
│   ├── mandarin-teacher-curriculum.md   # 12-module pedagogical curriculum
│   └── mandarin-web-interface-spec.md   # Complete functional spec for the web app
│
├── _backend/                 # Python FastAPI backend (AI + PDF processing)
│   ├── main.py               # FastAPI app, CORS, routes
│   ├── config.py             # Environment-based configuration
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # API keys and config (gitignored)
│   ├── .env.example          # Example environment file
│   ├── prompts/              # AI system prompts
│   └── services/             # AI service, PDF extraction, session generator
│
├── _webapp/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navigation.tsx)
│   │   ├── views/            # Page-level views (Dashboard, MaterialManager, etc.)
│   │   ├── stores/           # Zustand state management (appStore.ts)
│   │   ├── services/         # API client, file system access, demo generator
│   │   ├── utils/            # Helpers, formatters, report generator
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main app shell with theme + view router
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Tailwind v4 import, design tokens, animations
│   ├── public/               # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json         # Project references (app + node)
│   ├── package.json
│   └── dist/                 # Production build output
│
├── dev-mistakes.md           # Log of past bugs and prevention checklists
└── AGENTS.md                 # This file
```

### `_context/` — Learning Materials

This directory holds real user content. Do not delete, rename, or reorganize these files without explicit instruction.

- **`master/`** — Contains the primary course textbook and companion workbook PDFs.
  - Currently 6 PDFs covering 3 sessions (Textbook Sesi 1–3, Workbook Sesi 1–3).
  - File names are in Chinese/Indonesian (e.g., `初级上 (Textbook Sesi 1).pdf`).

- **`supporting/`** — Contains daily learning materials organized in `Day N/` folders.
  - Currently `Day 1` through `Day 24` exist.
  - Each day contains photos (WhatsApp images), screenshots, and video recordings (`.mp4`) of class sessions.
  - The spec allows up to `Day 365`.

### `_instructions/` — Specifications

These three documents are the **authoritative source of truth** for all implementation work. Read the relevant spec before writing any code.

| File | Purpose | When to Read |
|------|---------|--------------|
| `design-reference.md` | Complete design system: color tokens, typography, spacing, component styles, animations, accessibility, responsive breakpoints. | Before writing any CSS or UI components. |
| `mandarin-teacher-curriculum.md` | 12-module curriculum (Foundations → Fluency). Defines learning objectives, daily structure, quiz types, vocabulary building, and teaching guidelines. | Before implementing session generation, question logic, or scoring. |
| `mandarin-web-interface-spec.md` | Full functional specification: system architecture, user journeys, file system requirements, session execution flows, HTML report format, technical requirements, error handling. | **Start here.** This is the master spec. |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Build** | Vite 8+ | Fast development & production builds |
| **Frontend Framework** | React 19 + TypeScript 6 | Component-based UI with type safety |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **State Management** | Zustand 5 + persist middleware | Session state, user progress, LocalStorage sync |
| **Routing** | react-router-dom 7 | Client-side navigation |
| **Icons** | Lucide React | Clean, consistent iconography |
| **Audio** | Web Audio API | Recording and playback (browser-native) |
| **Canvas** | HTML5 Canvas API | Character writing input (田字格) |
| **File Handling** | File System Access API + `webkitdirectory` fallback | Native folder picker with cross-browser support |
| **Backend Framework** | FastAPI 0.110+ | Python API server |
| **Backend Runtime** | Uvicorn | ASGI server with auto-reload |
| **Backend Config** | python-dotenv, Pydantic v2 | Environment-based configuration |
| **PDF Processing** | PyMuPDF (fitz) | Text extraction and image conversion |
| **AI Client** | OpenAI Python SDK | Unified client for Moonshot, Gemini, and OpenAI |

---

## Build and Development Commands

### Frontend (`_webapp/`)

```bash
cd _webapp
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build: TypeScript compile + Vite bundle → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint check (TypeScript + React Hooks + Refresh)
```

### Backend (`_backend/`)

```bash
cd _backend
# Create and activate a virtual environment first
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Run the server
python main.py       # Starts uvicorn on port 8000 with reload
# Or directly:
uvicorn main:app --reload --port 8000
```

### Running Both Services

The frontend expects the backend at `http://localhost:8000`. CORS is configured to allow:
- `http://localhost:5173` (Vite dev)
- `http://localhost:8080` (static file server)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:8080`

### Production Build

The frontend production build outputs to `_webapp/dist/`. Since this is a client-side local app, open `dist/index.html` in a browser or use `npm run preview` to test. The backend is only needed at generation time; reports and session state are persisted client-side in LocalStorage.

---

## Code Organization

```
_webapp/src/
├── components/
│   └── Navigation.tsx          # Top navigation bar with theme toggle
├── views/
│   ├── Dashboard.tsx           # Home: stats, quick actions, material status
│   ├── MaterialManager.tsx     # Scan & browse _context/ folder contents
│   ├── SessionGenerator.tsx    # 3-step wizard: masters → days → config
│   ├── SessionExecution.tsx    # Active session: speaking/reading/writing
│   ├── ReportViewer.tsx        # Session results with score breakdown
│   └── SessionHistory.tsx      # Past sessions & score trend chart
├── stores/
│   └── appStore.ts             # Zustand store: context, sessions, reports, navigation, theme
├── services/
│   ├── api.ts                  # HTTP client for backend API
│   ├── fileSystem.ts           # File System Access API + webkitdirectory fallback
│   └── sessionGenerator.ts     # Demo question generator (client-side fallback)
├── utils/
│   └── helpers.ts              # Formatters, score calc, HTML report generator
├── types/
│   └── index.ts                # All TypeScript interfaces & constants
├── App.tsx                     # View router + theme provider
├── main.tsx                    # React DOM entry (StrictMode)
└── index.css                   # Tailwind v4 import, design tokens, animations

_backend/
├── main.py                     # FastAPI app, request/response models, routes
├── config.py                   # Config class: AI_PROVIDER, AI_MODEL, API keys, PORT, MOCK_MODE
├── prompts/
│   └── session_generator.txt   # System prompt for AI question generation
└── services/
    ├── ai_service.py           # OpenAI-compatible AI client wrapper
    ├── pdf_service.py          # PyMuPDF text extraction and image conversion
    ├── session_generator.py    # Orchestrator: load curriculum, collect materials, build prompt, parse AI response
    └── mock_generator.py       # Fallback question generator when AI is unavailable
```

---

## Design System

Follow the design reference strictly when building components. The design system uses:
- **Light theme** as default, with **dark theme** via `prefers-color-scheme: dark`, and an optional **OLED black theme**.
- **Accent color:** `#FF6B6B` (warm coral) — used sparingly.
- **Font:** Inter (loaded from Google Fonts) or system font stack.
- **Spacing scale:** 8px base (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).

All tokens are defined as CSS custom properties in `src/index.css` using Tailwind v4's `@theme` block. **Important:** custom tokens use the `--space-*` namespace, NOT `--spacing-*`, to avoid overriding Tailwind's built-in spacing scale (see `dev-mistakes.md` for details).

---

## Development Conventions and Code Style

### TypeScript
- Target: ES2023, JSX: `react-jsx`, module resolution: `bundler`.
- `noUnusedLocals` and `noUnusedParameters` are enabled — unused variables will fail the build.
- Use `type` imports where possible (`import type { ... }`).
- Prefer explicit types over `any`.

### CSS / Tailwind
- **Never define `--spacing-*` or `--color-*` tokens in `@theme`** unless intentionally overriding Tailwind defaults. Use project-specific prefixes like `--space-*` or `--ds-*` for custom tokens.
- **Avoid `max-w-* mx-auto` for layout centering.** Use explicit inline styles instead: `style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}`.
- **Do not use `display: flex; flex-direction: column` on the root app container** with `margin: 0 auto` on child elements — flex items with auto margins shrink to fit content. Use standard block layout for root containers.
- All theme-aware colors must use CSS custom properties (`var(--color-bg-primary)`, etc.), never hardcoded hex values in component logic.

### File Matching
- When matching filenames, always use case-insensitive substring matching (`.toLowerCase().includes(...)`), not `.startsWith()`.
- Consider word order variations, special characters (Chinese, spaces, parentheses), and mixed-language filenames.

### Browser API Compatibility
- Always provide graceful fallbacks for non-standard browser APIs.
- The File System Access API (`showDirectoryPicker`) is Chrome/Edge only; Safari/Firefox use `webkitdirectory` input fallback.
- Feature-detect with `'apiName' in window` rather than user-agent sniffing.

### General Patterns
- Components are default-exported functions in PascalCase.
- Utility functions are named exports in camelCase.
- Store actions are defined inline in Zustand; no separate action files.
- `useCallback` and `useRef` are used for event handlers and canvas references.

---

## Testing Strategy

**No tests exist yet.** The project does not include any test framework (Jest, Vitest, Playwright, Cypress, etc.). When implementing, consider:

- **Unit tests** for utility functions (file validation, curriculum module detection, score calculation).
- **Component tests** for UI interactions (file upload, audio recording, canvas drawing).
- **Integration tests** for end-to-end session flows.
- **Accessibility audits** using automated tools (contrast ratios, focus indicators, ARIA labels).

### Manual QA Checklist (from `dev-mistakes.md`)
Before declaring a feature complete:
1. Run `npm run build` and verify zero TypeScript errors.
2. Check that `dist/assets/index-*.css` does not contain unexpected utility overrides.
3. Hard-refresh the browser (Cmd+Shift+R) to clear cached assets.
4. Test on at least 2 viewports (desktop + narrow window).
5. Test the primary user journey end-to-end: Materials → Generate → Session → Report.
6. Test in Chrome, Safari, and Firefox for cross-browser compatibility.

---

## Backend Configuration

The backend reads configuration from `_backend/.env`. Copy `.env.example` to `.env` and fill in your API keys.

| Variable | Description |
|----------|-------------|
| `AI_PROVIDER` | `"gemini"`, `"moonshot"`, or `"openai"` |
| `AI_MODEL` | Model name (e.g., `gemini-2.5-pro`, `kimi-k2.6`, `gpt-4o`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `MOONSHOT_API_KEY` | Moonshot AI API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `CONTEXT_PATH` | Absolute or relative path to `_context/` folder |
| `PORT` | Backend server port (default: `8000`) |
| `MOCK_MODE` | Set to `true` to bypass AI and use demo questions |

**Important:** The backend falls back to mock questions automatically if the AI API fails or if `MOCK_MODE=true`.

---

## File System Conventions

The application relies on a strict folder convention under `_context/`:

```
_context/
├── master/
│   ├── textbook.*          # Primary textbook (required)
│   └── workbook.*          # Exercise workbook (strongly recommended)
└── supporting/
    ├── Day 1/
    │   ├── *.mp3 / *.m4a / *.wav   # Audio materials
    │   ├── *.pdf / *.docx / *.txt  # Documents
    │   └── *.png / *.jpg / *.jpeg  # Images
    ├── Day 2/
    └── ... (up to Day 365)
```

**Validation rules:**
- `_context/` must exist in the project root.
- `master/` must exist with at least one textbook file.
- Day folders must be named `Day 1`, `Day 2`, ... `Day N` (case-insensitive).
- Day numbers should be sequential without gaps for optimal curriculum alignment.

When writing file-management code, **preserve the existing `_context/` structure**. The real learning materials in `_context/` must not be moved, renamed, or deleted by application logic.

---

## Security and Privacy Considerations

- **All files remain local.** The application must not upload user materials to any cloud service without explicit opt-in.
- **Audio recordings** are stored locally and must be deletable by the user at any time.
- **HTML reports** must not contain personally identifiable information by default.
- **No tracking** — no analytics, cookies, or external requests without explicit user consent.
- **Microphone access** is requested only when entering the speaking section; a text-based fallback must exist if denied.
- **File system access** requires explicit user action via native folder picker.

---

## Curriculum Summary

The course has **12 progressive modules** (see `mandarin-teacher-curriculum.md` for full details):

| Module | Topic | Est. Duration |
|--------|-------|---------------|
| 1 | Foundations — Pinyin, Tones & Basic Greetings | 7–10 days |
| 2 | Essential Grammar & Daily Expressions | 10–12 days |
| 3 | Numbers, Dates, Time & Shopping | 10–12 days |
| 4 | Family, Relationships & Descriptions | 10–12 days |
| 5 | Food, Dining & Chinese Cuisine Culture | 10–12 days |
| 6 | Transportation, Travel & Directions | 10–12 days |
| 7 | Work, Study & Daily Routine | 10–12 days |
| 8 | Hobbies, Entertainment & Social Life | 10–12 days |
| 9 | Health, Body & Emotions | 10–12 days |
| 10 | Technology, Internet & Modern Life | 10–12 days |
| 11 | Culture, Traditions & Society | 10–12 days |
| 12 | Fluency & Real-World Mastery | 14–16 days |

Each daily session follows: **Theory → Practice → Quiz → Vocabulary Expansion**.

---

## Key Implementation Notes

1. **Start with the specifications.** Read `_instructions/mandarin-web-interface-spec.md` first, then `design-reference.md`, then `mandarin-teacher-curriculum.md`.
2. **Read `dev-mistakes.md` before any build-level or layout changes.** It documents resolved bugs with prevention checklists.
3. **The `_webapp/` directory is your workspace for frontend code.** The `_backend/` directory is your workspace for AI and PDF processing.
4. **Respect `_context/` content.** Those are real user learning materials. Any file operations inside `_context/` must be non-destructive and user-confirmed.
5. **Design-first development.** The design reference is extremely detailed — colors, typography, spacing, animations, and component specs are all defined. Match them precisely.
6. **Accessibility is required.** WCAG AA contrast, visible focus rings, `prefers-reduced-motion` support, and proper semantic HTML are mandatory.
7. **No deployment pipeline exists.** This is a client-side local application. The "deployment" is running the built app in a browser.

---

## Existing Files Summary

| Path | Type | Description |
|------|------|-------------|
| `_context/master/*.pdf` | PDF | Textbook and workbook files (Chinese/Indonesian titles) |
| `_context/supporting/Day N/*` | Mixed | Daily class photos, screenshots, and video recordings |
| `_instructions/design-reference.md` | Markdown | Complete UI/UX design system |
| `_instructions/mandarin-teacher-curriculum.md` | Markdown | 12-module Mandarin curriculum |
| `_instructions/mandarin-web-interface-spec.md` | Markdown | Full functional and technical specification |
| `_backend/main.py` | Python | FastAPI application entry point |
| `_backend/config.py` | Python | Environment configuration loader |
| `_backend/services/ai_service.py` | Python | OpenAI-compatible AI client |
| `_backend/services/pdf_service.py` | Python | PyMuPDF text extraction and image conversion |
| `_backend/services/session_generator.py` | Python | Orchestrates curriculum loading, material collection, AI prompt building |
| `_backend/services/mock_generator.py` | Python | Demo question fallback generator |
| `_backend/prompts/session_generator.txt` | Text | System prompt for AI question generation |
| `_webapp/src/App.tsx` | TypeScript | React app shell with view routing and theming |
| `_webapp/src/stores/appStore.ts` | TypeScript | Zustand store with LocalStorage persistence |
| `_webapp/src/services/api.ts` | TypeScript | Backend API client |
| `_webapp/src/services/fileSystem.ts` | TypeScript | File System Access API + cross-browser fallback |
| `_webapp/src/utils/helpers.ts` | TypeScript | Score calculation, report generation, HTML report builder |
| `_webapp/src/types/index.ts` | TypeScript | All domain types and constants |
| `dev-mistakes.md` | Markdown | Bug log and prevention guidelines |
| `AGENTS.md` | Markdown | This file |

---

*Last updated: 2026-05-28*
