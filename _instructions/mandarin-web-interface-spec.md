# Mandarin Learning Web Interface Specification

## Product Name
**Mandarin Mastery Review System**

## Overview
A web-based interface for remote Mandarin learners to upload their learning materials, generate structured review sessions based on a curriculum, and receive scored feedback with actionable insights. The system bridges uploaded study materials with an AI-driven curriculum to create personalized, skill-building review experiences.

---

## User Personas

### Primary User: Remote Mandarin Learner
- Self-paced learner using textbooks and daily materials
- Needs structured review to reinforce speaking, reading, and writing
- Wants clear progress tracking and improvement guidance
- Uploads their own study files and expects the system to organize them

### Secondary User: Study Partner / Tutor
- May review the learner's session results
- Wants to understand where the learner needs support
- Can access the HTML result reports to provide targeted help

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     WEB INTERFACE (Frontend)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Material     │  │ Review       │  │ Session          │    │
│  │ Upload &     │  │ Session      │  │ Execution &      │    │
│  │ Selection    │  │ Generator    │  │ Scoring          │    │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM (Local)                    │
│  /_context/                                                 │
│    ├── master/          (Textbook & Workbook PDFs)          │
│    │   ├── textbook.pdf                                     │
│    │   └── workbook.pdf                                     │
│    └── supporting/      (Daily learning materials)           │
│        ├── Day 1/                                           │
│        │   ├── audio_lesson.mp3                             │
│        │   ├── vocabulary.pdf                               │
│        │   └── grammar_notes.pdf                            │
│        ├── Day 2/                                           │
│        └── ...                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CURRICULUM ENGINE (AI)                    │
│  mandarin-teacher-curriculum.md                             │
│    ├── 12 Modules (Foundations → Fluency)                   │
│    ├── Daily Structure: Theory → Practice → Quiz → Vocab    │
│    └── Assessment: Speaking, Reading, Writing               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     OUTPUT (HTML Reports)                   │
│  review_result_YYYYMMDD_HHMMSS.html                       │
│    ├── Overall Score (0-100)                                │
│    ├── Skill Breakdown (Listening/Reading/Writing)          │
│    ├── Performance Insights                                 │
│    └── Improvement Recommendations                          │
└─────────────────────────────────────────────────────────────┘
```

---

## File System Requirements

### Directory Structure
The system operates on a strict folder convention. Users must organize their materials as follows:

```
_context/
├── master/
│   ├── textbook.pdf          [REQUIRED] Primary course textbook
│   └── workbook.pdf          [REQUIRED] Exercise workbook companion
│
└── supporting/
    ├── Day 1/
    │   ├── audio_lesson_1.mp3        [OPTIONAL] Listening materials
    │   ├── vocabulary_day1.pdf         [OPTIONAL] Vocabulary lists
    │   ├── grammar_notes_day1.pdf      [OPTIONAL] Grammar explanations
    │   ├── reading_passage_day1.pdf    [OPTIONAL] Reading exercises
    │   └── writing_prompt_day1.pdf     [OPTIONAL] Writing assignments
    │
    ├── Day 2/
    │   └── ... (same structure)
    │
    ├── Day 3/
    │   └── ...
    │
    └── Day N/
        └── ... (up to Day 365 max)
```

### File Naming Conventions
| Folder | File Type | Naming Pattern | Example |
|--------|-----------|----------------|---------|
| `master/` | Textbook | `textbook.*` | `textbook.pdf`, `textbook.epub` |
| `master/` | Workbook | `workbook.*` | `workbook.pdf`, `workbook.docx` |
| `supporting/Day N/` | Audio | `*.mp3`, `*.m4a`, `*.wav` | `audio_lesson_1.mp3` |
| `supporting/Day N/` | Document | `*.pdf`, `*.docx`, `*.txt` | `vocabulary_day1.pdf` |
| `supporting/Day N/` | Image | `*.png`, `*.jpg`, `*.jpeg` | `character_strokes.png` |

### Supported File Formats
| Category | Formats | Max Size |
|----------|---------|----------|
| Documents | PDF, DOCX, TXT, EPUB | 50 MB each |
| Audio | MP3, M4A, WAV, OGG | 100 MB each |
| Images | PNG, JPG, JPEG, WEBP | 20 MB each |
| Archives | ZIP (auto-extract) | 200 MB |

### Validation Rules
- [ ] `_context/` folder must exist in project root
- [ ] `master/` subfolder must exist with at least one textbook file
- [ ] `workbook.*` is strongly recommended but not strictly required
- [ ] `supporting/` subfolder is optional (system can generate from master only)
- [ ] Day folders must follow naming: `Day 1`, `Day 2`, ... `Day N` (case-insensitive)
- [ ] Day numbers must be sequential without gaps for optimal curriculum alignment
- [ ] System warns if Day folders are missing but does not block operation
- [ ] Duplicate filenames within a Day folder trigger overwrite warning

---

## User Journey & Interface Flow

### Journey 1: Material Upload & Management

#### Step 1: Access Material Manager
```
┌──────────────────────────────────────────────────────────┐
│  📚 Mandarin Mastery Review System                        │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  [📁 Open _context Folder]  [🔄 Scan & Refresh]          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📂 _context/                                       │  │
│  │  ├── 📁 master/          [2 files]  ✓ Valid       │  │
│  │  │   ├── 📄 textbook.pdf    12.4 MB               │  │
│  │  │   └── 📄 workbook.pdf     8.1 MB               │  │
│  │  └── 📁 supporting/        [3 days]  ✓ Valid       │  │
│  │      ├── 📁 Day 1/         [4 files]              │  │
│  │      ├── 📁 Day 2/         [3 files]              │  │
│  │      └── 📁 Day 3/         [4 files]              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [➕ Upload New File]  [📋 View File Details]            │
│                                                           │
│  Status: ✅ All materials ready for review generation     │
└──────────────────────────────────────────────────────────┘
```

#### Step 2: Upload New Materials
- **Drag-and-drop zone** for bulk file upload
- **Auto-categorization** based on filename patterns:
  - Files matching `textbook*` → `master/`
  - Files matching `workbook*` → `master/`
  - Files with `day` or `Day` in name → parsed for day number → `supporting/Day N/`
  - Uncategorized files → user prompted to select destination
- **Upload progress** with file-type validation
- **Duplicate detection** with "Keep Both / Replace / Skip" options
- **Format conversion** (EPUB→TXT extraction, DOCX→text extraction for AI processing)

#### Step 3: Material Preview
- Click any file to open **preview panel**:
  - PDF: Rendered page viewer with text extraction sidebar
  - Audio: Waveform player with transcript area (if available)
  - Images: Full viewer with zoom
- **Metadata display**: File size, upload date, word count (for text), duration (for audio)
- **Content tagging**: User can add tags (e.g., "HSK1", "grammar", "speaking focus") for filtering

---

### Journey 2: Review Session Generation

#### Step 1: Select Master Materials
```
┌──────────────────────────────────────────────────────────┐
│  🎯 Generate Review Session                               │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  STEP 1: Select Master Materials                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📁 master/                                         │  │
│  │                                                       │  │
│  │  ☑️ textbook.pdf    [Primary Textbook]              │  │
│  │     └─ 284 pages | HSK 1-2 content detected         │  │
│  │                                                       │  │
│  │  ☑️ workbook.pdf    [Exercise Workbook]              │  │
│  │     └─ 156 pages | 12 chapters detected               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [Auto-detect Curriculum Module] → Module 2: Essential   │
│  Grammar & Daily Expressions                              │
│                                                           │
│  [▶️ Next: Select Supporting Materials]                  │
└──────────────────────────────────────────────────────────┘
```

**Master Material Selection Rules:**
- Both textbook and workbook are **pre-selected by default** if present
- User can **uncheck** either (minimum one master required)
- System **auto-detects** curriculum module alignment based on:
  - Table of contents parsing
  - Keyword frequency (e.g., "greetings", "numbers", "grammar")
  - Page count and chapter structure
- User can **override** auto-detection and manually select module (1–12)

#### Step 2: Select Supporting Materials
```
┌──────────────────────────────────────────────────────────┐
│  🎯 Generate Review Session                               │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  STEP 2: Select Supporting Materials                     │
│                                                           │
│  📅 Curriculum Alignment: Module 2 (Days 8–19)            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Select Day Folders to Include:                      │  │
│  │                                                       │  │
│  │  ☑️ Day 1    [4 files]  ── 基础问候 Basic Greetings │  │
│  │  ☑️ Day 2    [3 files]  ── 数字 Numbers             │  │
│  │  ☑️ Day 3    [4 files]  ── 家庭 Family              │  │
│  │  ☐ Day 4    [0 files]  ── (empty folder)            │  │
│  │  ☐ Day 5    [2 files]  ── 时间 Time                 │  │
│  │                                                       │  │
│  │  [☑️ Select All]  [☐️ Select None]  [🔀 Smart Select] │  │
│  │                                                       │  │
│  │  Smart Select: Auto-pick days matching Module 2       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  📊 Selected: 3 days | 11 files | Est. 45 min session     │
│                                                           │
│  [◀️ Back]  [▶️ Next: Configure Session]                  │
└──────────────────────────────────────────────────────────┘
```

**Supporting Material Selection Rules:**
- Day folders are **sorted chronologically**
- **Smart Select** button auto-selects days that align with detected curriculum module
- **Empty folders** are shown but grayed out
- **File count** displayed per day for transparency
- **Estimated session duration** calculated based on:
  - Audio duration × 1.5 (for listening exercises)
  - Word count ÷ 150 WPM (for reading)
  - Writing prompts × 8 min each (for writing)
- User can **expand each day** to see individual files and selectively include/exclude

#### Step 3: Configure Session Parameters
```
┌──────────────────────────────────────────────────────────┐
│  🎯 Generate Review Session                               │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  STEP 3: Configure Review Session                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  🗣️ Speaking / Listening                            │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  ☑️ Include listening comprehension                  │  │
│  │     └─ Source: Day 1 audio + Day 2 audio            │  │
│  │  ☑️ Include speaking prompts                         │  │
│  │     └─ 3 prompts | Record and upload audio          │  │
│  │  ☐ Include tone drills                               │  │
│  │                                                       │  │
│  │  📖 Reading                                           │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  ☑️ Include character recognition                    │  │
│  │     └─ 20 characters from selected days             │  │
│  │  ☑️ Include reading comprehension                    │  │
│  │     └─ 2 passages | 150–200 chars each            │  │
│  │  ☐ Include speed reading challenge                   │  │
│  │                                                       │  │
│  │  ✍️ Writing                                           │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  ☑️ Include character writing                        │  │
│  │     └─ 10 characters | Grid paper upload             │  │
│  │  ☑️ Include sentence composition                     │  │
│  │     └─ 5 sentences using new grammar               │  │
│  │  ☑️ Include short essay                              │  │
│  │     └─ 100–150 characters | Topic: My Family       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ⚙️ Advanced Options:                                     │
│  • Difficulty: [Beginner ▼]  • Time Limit: [None ▼]     │
│  • Focus Area: [Balanced ▼]  • AI Strictness: [Normal ▼] │
│                                                           │
│  [◀️ Back]  [⚡ Generate Review Session]                   │
└──────────────────────────────────────────────────────────┘
```

**Session Configuration Rules:**
- All three skill areas (Speaking/Listening, Reading, Writing) are **enabled by default**
- **Difficulty levels**: Beginner / Intermediate / Advanced (auto-suggested based on module)
- **Time limits**: None / 30 min / 45 min / 60 min (per section or total)
- **Focus area options**: Balanced / Speaking-heavy / Reading-heavy / Writing-heavy / Grammar-focus / Vocabulary-focus
- **AI Strictness**: Lenient (encouraging) / Normal (standard HSK criteria) / Strict (near-native expectations)
- **Session generation** takes 15–60 seconds depending on material volume
- **Progress indicator** shows: "Analyzing materials… → Building questions… → Generating session…"

---

### Journey 3: Review Session Execution

#### Session Dashboard
```
┌──────────────────────────────────────────────────────────┐
│  📝 Review Session #042                                   │
│  📅 May 15, 2026 | ⏱️ 45 minutes estimated                │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  PROGRESS                                             │  │
│  │  ████████████░░░░░░░░  60% (3/5 sections)            │  │
│  │                                                       │  │
│  │  🗣️ Listening     ████████████░░  80%  [Review]      │  │
│  │  🗣️ Speaking      ██████████░░░░  66%  [Review]      │  │
│  │  📖 Reading       ☐☐☐☐☐☐☐☐☐☐  0%   [Start ▶]         │  │
│  │  ✍️ Writing       ☐☐☐☐☐☐☐☐☐☐  0%   [Locked 🔒]       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [💾 Save Progress]  [⏸️ Pause Session]  [❌ Abandon]    │
└──────────────────────────────────────────────────────────┘
```

**Session Execution Rules:**
- Sessions are **section-based**; each skill area has multiple sub-sections
- **Progress auto-saves** after every question/response
- **Pause functionality** allows resuming within 24 hours
- **Skip button** available per question (marks as skipped, affects scoring)
- **Time tracking** per section; optional time warnings at 50% and 80% of limit

---

#### Section A: Listening Comprehension
```
┌──────────────────────────────────────────────────────────┐
│  🎧 Listening Comprehension — Question 3 of 5             │
│  ⏱️ Section time: 12:34 remaining                        │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  [▶️ Play Audio]  [⏸️ Pause]  [🔁 Replay (2 left)]       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  🎵 Now Playing: Day 2 — Numbers Dialogue            │  │
│  │  0:00 ━━━━━━━━━━━━━━━━━━━━━━━  0:45                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Question: What time does the speaker's class start?     │
│                                                           │
│  ○ A) 8:00 AM   (八点)                                   │
│  ○ B) 9:00 AM   (九点)  ← Selected                       │
│  ○ C) 10:00 AM  (十点)                                   │
│  ○ D) 11:00 AM  (十一点)                                 │
│                                                           │
│  [💡 Hint: Listen for "shàngkè" and a number after it]   │
│                                                           │
│  [◀️ Previous]  [✅ Submit]  [▶️ Skip → Next]            │
└──────────────────────────────────────────────────────────┘
```

**Listening Section Features:**
- **Audio player** with play/pause, replay limit (default 3 replays per question), speed control (0.75x, 1.0x, 1.25x)
- **Question types**: Multiple choice, true/false, fill-in-blank, sequencing
- **Transcript reveal** available after submission (for learning, not during test)
- **Source attribution**: Shows which Day folder the audio came from

---

#### Section B: Speaking Prompts
```
┌──────────────────────────────────────────────────────────┐
│  🎤 Speaking Prompt — Question 2 of 3                     │
│  ⏱️ Section time: 8:45 remaining                          │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  📋 Prompt:                                               │
│  "Introduce your family. Mention at least 3 family       │
│   members, their relationship to you, and one fact about   │
│   each person. Use the grammar point: 的 (possessive)."   │
│                                                           │
│  ⏺️ Recording...  0:34 / 2:00 max                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  🎙️ ●━━━━━○━━━━━━━━━━━━━━━━━━  0:34                │  │
│  │     [⏹️ Stop]  [🔄 Retake]  [⏩ Submit]             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  💡 Tips:                                                 │
│  • Speak clearly and at natural pace                     │
│  • Use 的 after pronouns: 我的妈妈, 他的工作              │
│  • Minimum target: 4–5 sentences                         │
│                                                           │
│  [◀️ Previous]  [▶️ Skip → Next]                         │
└──────────────────────────────────────────────────────────┘
```

**Speaking Section Features:**
- **Browser-based recording** using Web Audio API (fallback to file upload)
- **Max duration** per prompt: 2 minutes (configurable)
- **Retake allowed** up to 3 times per prompt
- **Real-time waveform visualization** during recording
- **Transcription request**: User can request AI transcription of their speech for review
- **Rubric displayed** after submission: pronunciation, tone accuracy, grammar, fluency, content completeness

---

#### Section C: Reading Comprehension
```
┌──────────────────────────────────────────────────────────┐
│  📖 Reading Comprehension — Question 4 of 8               │
│  ⏱️ Section time: 15:20 remaining                         │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📄 Passage: "My Daily Routine" (Day 7 Material)    │  │
│  │                                                       │  │
│  │  我叫李明。我是大学生。每天早上七点起床，            │  │
│  │  然后洗澡、吃早饭。八点我去上课。中午十二点           │  │
│  │  我和朋友一起吃饭。下午我常常去图书馆。晚上            │  │
│  │  我看书或者看电影。十一点睡觉。                        │  │
│  │                                                       │  │
│  │  [🔍 Zoom In]  [🔊 Listen to Audio]  [📋 Translate]   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  Question: What does Li Ming do at 12 PM?                │
│                                                           │
│  ○ A) He goes to class                                   │
│  ○ B) He eats with friends  ← Selected                   │
│  ○ C) He goes to the library                             │
│  ○ D) He watches movies                                  │
│                                                           │
│  [◀️ Previous]  [✅ Submit]  [▶️ Skip → Next]            │
└──────────────────────────────────────────────────────────┘
```

**Reading Section Features:**
- **Passage display** with Pinyin toggle (show/hide above characters)
- **Audio narration** available for listening-while-reading
- **Translation toggle** for sentence-by-sentence English (post-submission only)
- **Character click**: Click any character to see stroke order, meaning, and usage
- **Question types**: Multiple choice, short answer, true/false, matching, ordering

---

#### Section D: Character Writing
```
┌──────────────────────────────────────────────────────────┐
│  ✍️ Character Writing — Character 7 of 10                 │
│  ⏱️ Section time: 10:00 remaining                         │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  Write this character from memory:                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              家  (jiā — home/family)                │  │
│  │                                                     │  │
│  │     Pinyin: jiā    |    Strokes: 10               │  │
│  │                                                     │  │
│  │  [👁️ Show Stroke Order Animation]                  │  │
│  │  [📖 Show Etymology: 宀 (roof) + 豕 (pig)]          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📝 Your Answer:                                     │  │
│  │                                                     │  │
│  │     ┌───┬───┬───┐                                  │  │
│  │     │   │   │   │  ← Draw here or upload image      │  │
│  │     ├───┼───┼───┤                                  │  │
│  │     │   │   │   │                                  │  │
│  │     └───┴───┴───┘                                  │  │
│  │                                                     │  │
│  │  [📤 Upload Photo]  [🖊️ Draw with Mouse/Touch]     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [◀️ Previous]  [✅ Submit]  [▶️ Skip → Next]            │
└──────────────────────────────────────────────────────────┘
```

**Writing Section Features:**
- **Canvas drawing** with mouse/touch/stylus on 田字格 (rice grid) background
- **Photo upload** for handwritten paper submissions
- **Stroke order animation** available as a hint (costs 1 hint point)
- **Etymology display** to aid memory (e.g., 家 = roof + pig = traditional family home)
- **Character recognition** by AI: compares uploaded image to standard stroke order
- **Composition mode**: Rich text editor with Pinyin input method support for essays

---

#### Section E: Essay Composition
```
┌──────────────────────────────────────────────────────────┐
│  📝 Essay Composition                                     │
│  ⏱️ Section time: 20:00 remaining                         │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  Topic: Write about your best friend (150–200 characters)│
│                                                           │
│  Requirements:                                            │
│  • Use at least 3 descriptive adjectives                  │
│  • Use 比 (comparison) at least once                      │
│  • Mention how you met and one activity you do together   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  📝 Composition Editor                                │  │
│  │                                                       │  │
│  │  我的好朋友叫______。他/她______。我们______          │  │
│  │  认识，因为______。他/她比我很______。我们常常        │  │
│  │  一起______。我觉得他/她非常______。                   │  │
│  │                                                       │  │
│  │  Character count: 89 / 150 minimum                    │  │
│  │  Grammar check: ⚠️ 比 structure not yet used          │  │
│  │                                                       │  │
│  │  [🔤 Pinyin Input]  [📋 Template]  [💡 Vocab Helper]  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [◀️ Previous]  [💾 Save Draft]  [✅ Submit Final]        │
└──────────────────────────────────────────────────────────┘
```

**Essay Section Features:**
- **Rich text editor** with Pinyin-to-character conversion (like Google Pinyin)
- **Real-time character count** with min/max indicators
- **Grammar helper**: Underlines potential errors and suggests corrections
- **Vocabulary helper**: Suggests words from current module's vocabulary list
- **Template option**: Provides sentence starters for struggling learners
- **Auto-save draft** every 30 seconds

---

### Journey 4: Result Generation & Review

#### Completion Screen
```
┌──────────────────────────────────────────────────────────┐
│  ✅ Review Session Complete!                              │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  🎉 Congratulations! You've finished Review Session #042   │
│                                                           │
│  ⏱️ Total time: 38 minutes                                │
│  📊 Questions answered: 23 / 25 (2 skipped)                │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  OVERALL SCORE                                        │  │
│  │                                                       │  │
│  │              ┌─────────┐                             │  │
│  │              │         │                             │  │
│  │              │   78    │  / 100                      │  │
│  │              │         │                             │  │
│  │              └─────────┘                             │  │
│  │                                                       │  │
│  │  Rating: 🟡 Developing (Target: 80%+ for Proficient)│  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  [📄 View Full Report]  [🔄 Retry Missed Questions]       │
│  [📥 Download HTML Report]  [🏠 Return to Dashboard]      │
└──────────────────────────────────────────────────────────┘
```

---

## HTML Result Report Specification

### File Naming
```
review_result_YYYYMMDD_HHMMSS.html
Example: review_result_20260515_143022.html
```

### Report Structure

#### 1. Header Section
```html
<!-- Report Header -->
<div class="report-header">
  <h1>🎓 Mandarin Mastery Review Report</h1>
  <div class="meta">
    <span>Session #042</span>
    <span>May 15, 2026</span>
    <span>Module 2: Essential Grammar & Daily Expressions</span>
    <span>Duration: 38 minutes</span>
  </div>
</div>
```

#### 2. Overall Score Display
| Element | Specification |
|---------|---------------|
| **Score display** | Large circular gauge (0–100) with color coding |
| **Color coding** | 90–100: 🟢 Green (Excellent) / 80–89: 🔵 Blue (Proficient) / 70–79: 🟡 Yellow (Developing) / <70: 🔴 Red (Needs Support) |
| **Rating label** | Text rating with emoji indicator |
| **Pass threshold** | Clearly marked at 80% |

#### 3. Skill Breakdown
```html
<!-- Skill Breakdown -->
<div class="skill-breakdown">
  <h2>📊 Skill Breakdown</h2>

  <div class="skill-card">
    <div class="skill-icon">🎧</div>
    <div class="skill-name">Listening Comprehension</div>
    <div class="skill-score">85/100</div>
    <div class="skill-bar"><div style="width: 85%"></div></div>
    <div class="skill-status">✅ Proficient</div>
  </div>

  <div class="skill-card">
    <div class="skill-icon">🎤</div>
    <div class="skill-name">Speaking / Pronunciation</div>
    <div class="skill-score">72/100</div>
    <div class="skill-bar"><div style="width: 72%"></div></div>
    <div class="skill-status">🟡 Developing — Tone accuracy needs work</div>
  </div>

  <div class="skill-card">
    <div class="skill-icon">📖</div>
    <div class="skill-name">Reading Comprehension</div>
    <div class="skill-score">90/100</div>
    <div class="skill-bar"><div style="width: 90%"></div></div>
    <div class="skill-status">✅ Excellent — Strong character recognition</div>
  </div>

  <div class="skill-card">
    <div class="skill-icon">✍️</div>
    <div class="skill-name">Writing / Composition</div>
    <div class="skill-score">65/100</div>
    <div class="skill-bar"><div style="width: 65%"></div></div>
    <div class="skill-status">🔴 Needs Support — Stroke order errors frequent</div>
  </div>
</div>
```

**Skill Breakdown Rules:**
- Each skill scored 0–100 independently
- **Weighted overall score**: Listening 25% + Speaking 25% + Reading 25% + Writing 25%
- **Status** auto-assigned based on score thresholds
- **Context note** added per skill explaining the specific strength or weakness

#### 4. Performance Insights
```html
<!-- Performance Insights -->
<div class="insights">
  <h2>🔍 Performance Insights</h2>

  <div class="insight-card strength">
    <h3>💪 Strengths</h3>
    <ul>
      <li><strong>Character Recognition:</strong> You correctly identified 18/20 characters (90%). 
          Focus on radicals is paying off — you recognized 家 by its 宀 roof radical instantly.</li>
      <li><strong>Reading Speed:</strong> You read the 200-character passage in 2:34, which is 
          above average for Module 2 learners (avg: 3:15).</li>
      <li><strong>Grammar Application:</strong> You used 的 correctly in 8/9 instances. 
          Possessive structures are becoming automatic.</li>
    </ul>
  </div>

  <div class="insight-card weakness">
    <h3>🎯 Areas for Improvement</h3>
    <ul>
      <li><strong>Tone Accuracy (Speaking):</strong> 3rd tone was only correct 45% of the time. 
          You tend to pronounce 你好 as "nì hǎo" instead of "ní hǎo" (3rd tone sandhi). 
          Practice the "dipping then rising" motion more deliberately.</li>
      <li><strong>Stroke Order (Writing):</strong> 家 was written with incorrect stroke sequence 
          (you wrote 豕 before 宀). Remember: <em>top-to-bottom, outside-in</em>.</li>
      <li><strong>Measure Words:</strong> You used 个 for books (should be 本) and people 
          (should be 位 for polite context). Review Module 2 Day 9 measure word chart.</li>
    </ul>
  </div>

  <div class="insight-card pattern">
    <h3>📈 Progress Patterns</h3>
    <ul>
      <li><strong>Consistency:</strong> Your scores have improved 12% over the last 3 sessions 
          (66 → 72 → 78). Daily practice is showing results.</li>
      <li><strong>Time Management:</strong> You spent 40% of time on Writing but it was your 
          lowest score. Consider reallocating practice time to speaking drills.</li>
    </ul>
  </div>
</div>
```

**Insights Generation Rules:**
- **Strengths**: Highlight top 3 areas with specific examples from the session
- **Weaknesses**: Identify bottom 3 areas with concrete examples and reference to curriculum module/day
- **Patterns**: Compare to previous sessions (if available) to show trends
- **All insights** must reference specific questions/characters/grammar points from the actual session

#### 5. Improvement Recommendations
```html
<!-- Improvement Recommendations -->
<div class="recommendations">
  <h2>🚀 How to Improve</h2>

  <div class="rec-card priority-high">
    <div class="rec-priority">🔴 High Priority</div>
    <h3>1. Master 3rd Tone Sandhi</h3>
    <p><strong>Why:</strong> This is blocking your speaking fluency and causing cascading errors 
       in listening comprehension.</p>
    <p><strong>Action:</strong> Complete the tone drill mini-course (Module 1 Day 3–4 review). 
       Practice these pairs daily for 5 minutes:</p>
    <ul>
      <li>你好 (nǐ hǎo → ní hǎo)</li>
      <li>很好 (hěn hǎo → hén hǎo)</li>
      <li>小姐 (xiǎo jiě → xiáo jiě)</li>
    </ul>
    <p><strong>Target:</strong> 80% accuracy in tone pairs before next session.</p>
    <p><strong>Resource:</strong> <a href="#">Open Module 1 Tone Drill →</a></p>
  </div>

  <div class="rec-card priority-medium">
    <div class="rec-priority">🟡 Medium Priority</div>
    <h3>2. Practice 家 Character Stroke Order</h3>
    <p><strong>Why:</strong> Incorrect stroke order slows writing speed and affects character 
       recognition memory.</p>
    <p><strong>Action:</strong> Use the stroke order animation tool. Write 家 20 times on grid 
       paper following the correct sequence: 丶 丶 乛 一 丿 ㇁ 丿 丿 ㇏ 丶</p>
    <p><strong>Target:</strong> Write from memory with 100% stroke order accuracy.</p>
    <p><strong>Resource:</strong> <a href="#">Open Character Practice: 家 →</a></p>
  </div>

  <div class="rec-card priority-low">
    <div class="rec-priority">🟢 Low Priority</div>
    <h3>3. Expand Measure Word Vocabulary</h3>
    <p><strong>Why:</strong> Currently using 个 as a universal fallback. While understandable, 
       it sounds less natural.</p>
    <p><strong>Action:</strong> Learn 5 new measure words this week: 本 (books), 张 (paper/photos), 
       杯 (drinks), 件 (clothes), 条 (long things).</p>
    <p><strong>Target:</strong> Use correct measure words in 70% of contexts.</p>
    <p><strong>Resource:</strong> <a href="#">Open Measure Word Flashcards →</a></p>
  </div>
</div>
```

**Recommendations Rules:**
- **Prioritized** by impact on overall score and learning progression
- **Actionable** — each recommendation has a specific, measurable action
- **Curriculum-linked** — references specific modules, days, and resources
- **Targeted** — sets a concrete accuracy goal for the learner to achieve
- **Resource-linked** — provides direct links to relevant practice materials

#### 6. Question Review Section
```html
<!-- Question Review -->
<div class="question-review">
  <h2>📝 Question-by-Question Review</h2>

  <div class="question-item correct">
    <div class="q-status">✅ Correct</div>
    <div class="q-number">Q3</div>
    <div class="q-type">Listening</div>
    <div class="q-content">What time does class start?</div>
    <div class="q-your-answer">B) 9:00 AM (九点)</div>
    <div class="q-explanation">Correct! The speaker says "wǒmen jiǔ diǎn shàngkè" 
         (我们九点上课). 九 is clearly articulated with a rising 3rd tone.</div>
  </div>

  <div class="question-item incorrect">
    <div class="q-status">❌ Incorrect</div>
    <div class="q-number">Q7</div>
    <div class="q-type">Writing — Character</div>
    <div class="q-content">Write 家 from memory</div>
    <div class="q-your-answer">[Uploaded image: stroke order incorrect]</div>
    <div class="q-correct-answer">Correct order: 丶 丶 乛 一 丿 ㇁ 丿 丿 ㇏ 丶</div>
    <div class="q-explanation">You wrote the bottom 豕 component before the top 宀. 
         Remember the rule: <strong>top-to-bottom</strong>. The roof radical always 
         comes first to "cover" what's inside.</div>
    <div class="q-resource">[📹 Watch Stroke Order Animation]</div>
  </div>

  <div class="question-item skipped">
    <div class="q-status">⏭️ Skipped</div>
    <div class="q-number">Q15</div>
    <div class="q-type">Speaking</div>
    <div class="q-content">Describe your hometown for 90 seconds</div>
    <div class="q-explanation">No submission recorded. Consider retrying this prompt 
         to build speaking confidence.</div>
    <div class="q-resource">[🎤 Retry This Prompt]</div>
  </div>
</div>
```

**Question Review Rules:**
- **All questions** displayed in collapsible sections
- **Correct answers**: Brief positive reinforcement + explanation of why it's right
- **Incorrect answers**: Show what was wrong, show correct answer, explain the rule
- **Skipped questions**: Encourage retry with direct link
- **Audio/Images**: Embedded directly in the review for context

#### 7. Footer & Export
```html
<!-- Report Footer -->
<div class="report-footer">
  <div class="export-options">
    <button>📥 Download as HTML</button>
    <button>📄 Print Report</button>
    <button>📧 Share with Tutor</button>
  </div>

  <div class="next-steps">
    <h3>🎯 Recommended Next Steps</h3>
    <p>Based on your performance, we recommend:</p>
    <ol>
      <li>Complete the <strong>3rd Tone Sandhi mini-course</strong> (15 min)</li>
      <li>Practice <strong>character writing</strong> for 家, 我, 好 (10 min)</li>
      <li>Proceed to <strong>Module 2 Day 10</strong> when ready</li>
    </ol>
    <button class="cta">🚀 Start Next Learning Session</button>
  </div>

  <div class="disclaimer">
    <p>Report generated by Mandarin Mastery Review System • AI-assisted assessment • 
       For educational purposes only • Consult a human tutor for definitive evaluation</p>
  </div>
</div>
```

### HTML Report Styling Requirements

All HTML result reports must strictly adhere to the design reference (dona.ai-inspired). The report is a standalone HTML file that must feel **human-first, minimal, and delightful** — like a premium learning companion, not a machine-generated form.

#### Color Tokens (CSS Custom Properties)
```css
:root {
  /* Light Theme (Default) */
  --bg-primary: #FFFFFF;
  --bg-surface: #F5F5F7;
  --text-primary: #1D1D1F;
  --text-secondary: #6E6E73;
  --accent: #FF6B6B;
  --accent-hover: #FF8585;
  --border: #E5E5EA;
  --success: #34C759;
  --success-bg: rgba(52, 199, 89, 0.08);
  --warning: #FF9500;
  --warning-bg: rgba(255, 149, 0, 0.08);
  --error: #FF3B30;
  --error-bg: rgba(255, 59, 48, 0.08);
  --hover-surface: #EBEBF0;
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-button: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1C1C1E;
    --bg-surface: #2C2C2E;
    --text-primary: #FFFFFF;
    --text-secondary: #8E8E93;
    --accent: #FF6B6B;
    --accent-hover: #FF8585;
    --border: #38383A;
    --success: #30D158;
    --success-bg: rgba(48, 209, 88, 0.12);
    --warning: #FF9F0A;
    --warning-bg: rgba(255, 159, 10, 0.12);
    --error: #FF453A;
    --error-bg: rgba(255, 69, 58, 0.12);
    --hover-surface: #3A3A3C;
    --shadow-card: none;
    --shadow-elevated: none;
    --shadow-button: none;
  }
}

/* OLED Black Theme (optional class toggle) */
.theme-oled {
  --bg-primary: #000000;
  --bg-surface: #1C1C1E;
  --text-primary: #FFFFFF;
  --text-secondary: #8E8E93;
  --border: #38383A;
}
```

**Color Usage Rules:**
- **Accent (#FF6B6B warm coral)** is used sparingly — only for score gauges, primary CTAs, active states, and key highlights
- **Success green** for positive/completed states; never use green as a primary action color
- **High contrast** between text and background at all times (minimum 4.5:1 for body, 3:1 for large text)
- **Subtle borders** — almost invisible but enough to define structure; prefer borders over shadows in dark mode
- **Surface color** for all cards, containers, and secondary backgrounds; never use pure white (#FFF) for cards in light mode except the page background

#### Typography
```css
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'Menlo', monospace;
}
```

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | `48px` | 700 (Bold) | 1.1 | `-0.02em` | Overall score number |
| H1 | `32px` | 700 | 1.2 | `-0.01em` | Report title |
| H2 | `24px` | 600 (Semibold) | 1.3 | `-0.01em` | Section headings (Skill Breakdown, Insights) |
| H3 | `20px` | 600 | 1.4 | `0` | Card titles, sub-sections |
| Body | `16px` | 400 (Regular) | 1.5 | `0` | Primary body text, explanations |
| Body Small | `14px` | 400 | 1.5 | `0` | Secondary descriptions, metadata |
| Caption | `12px` | 500 (Medium) | 1.4 | `0.01em` | Labels, timestamps, file info |
| Button | `14px` | 600 | 1 | `0` | CTA buttons |
| Score Label | `14px` | 600 | 1.2 | `0` | Score category labels |

**Typography Rules:**
- **Tight letter-spacing** on large headings for a modern, refined look
- **Slightly positive tracking** (`0.01em`) on small captions for readability
- **Semibold (600)** is the maximum weight for body text — avoid heavy/bulky text
- **Line height is generous** (1.5x) for body text to ensure comfortable reading
- **Color hierarchy**: Primary text `#1D1D1F` (light) / `#FFFFFF` (dark), secondary `#6E6E73` (light) / `#8E8E93` (dark)
- Chinese characters in the report should use the same font stack (Inter supports CJK fallback gracefully)

#### Spacing & Layout
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --max-width: 1200px;
  --page-padding-mobile: 24px;
  --page-padding-tablet: 48px;
  --page-padding-desktop: 64px;
  --card-padding: 24px;
  --card-radius: 20px;
  --button-radius: 9999px;
  --input-radius: 12px;
  --item-radius: 12px;
}
```

**Layout Rules:**
- **Max container width**: `1200px` centered with auto margins
- **Page padding**: `24px` on mobile, `48px` on tablet, `64px` on desktop
- **Card padding**: `24px` consistently
- **Section spacing**: `64px` to `96px` between major report sections
- **Content-first layout** — generous whitespace; UI elements recede so content stands forward
- **Minimal chrome** — no heavy borders, no excessive shadows, no decorative noise

#### Component Specifications

**Score Gauge (Hero Element)**
- Circular SVG progress indicator, `160px` diameter on desktop, `120px` on mobile
- **Stroke**: `12px` width, rounded caps (`stroke-linecap: round`)
- **Color**: Track uses `var(--border)`; fill uses `var(--accent)` for scores < 80, `var(--success)` for scores ≥ 80
- **Number inside**: Display size (`48px`, weight 700, tight letter-spacing), centered
- **Label below**: Caption size (`12px`, weight 500, secondary text color)
- **Animation**: Fill animates from 0 to score over `800ms` with `cubic-bezier(0.4, 0, 0.2, 1)` on page load

**Skill Cards**
- Background: `var(--bg-surface)`
- Border-radius: `var(--card-radius)` (20px)
- Padding: `var(--card-padding)` (24px)
- Shadow: `var(--shadow-card)` in light mode; `1px solid var(--border)` in dark mode
- **Left border accent**: `4px` solid color indicating status:
  - Excellent (90–100): `var(--success)`
  - Proficient (80–89): `#007AFF` (blue — distinct from accent)
  - Developing (70–79): `var(--warning)`
  - Needs Support (<70): `var(--error)`
- **Internal layout**: Icon (24px) + Skill name (H3, 20px semibold) + Score (Display size, right-aligned) + Progress bar + Status text (Body Small, secondary color)
- **Progress bar**: `8px` height, `9999px` radius (pill), track `var(--border)`, fill colored by status
- **Hover**: Subtle `transform: scale(1.01)` + `transition: 200ms cubic-bezier(0.4, 0, 0.2, 1)`

**Insight Cards**
- Same base styling as Skill Cards
- **Strength cards**: Left border `var(--success)`, icon 💪 in success color
- **Weakness cards**: Left border `var(--warning)`, icon 🎯 in warning color
- **Pattern cards**: Left border `var(--text-secondary)`, icon 📈 in secondary color
- **Content padding**: Generous; text should never feel cramped
- **Lists inside**: `8px` gap between items, bullet points replaced by subtle dashes or icons

**Priority Recommendation Cards**
- Same base styling as Skill Cards
- **High Priority**: Left border `var(--error)`, header background `var(--error-bg)`
- **Medium Priority**: Left border `var(--warning)`, header background `var(--warning-bg)`
- **Low Priority**: Left border `var(--success)`, header background `var(--success-bg)`
- **Priority badge**: Pill-shaped (`9999px` radius), small text (`12px`, weight 600), colored background with matching text color
- **Resource links**: Accent color text, no underline, hover underline appears with `200ms` transition

**Question Review Items**
- Background: `var(--bg-surface)`
- Border-radius: `var(--item-radius)` (12px)
- Padding: `16px` to `20px`
- **Status indicator**: Left edge color + icon
  - Correct: `var(--success)` + ✅
  - Incorrect: `var(--error)` + ❌
  - Skipped: `var(--text-secondary)` + ⏭️
- **Collapsible**: Default collapsed; expand on click with smooth `300ms` height transition
- **Content inside**: Monospace font for Chinese characters/Pinyin; regular font for explanations

**Buttons (CTAs in Report Footer)**
- **Primary**: `var(--accent)` background, white text, pill-shaped (`9999px`), padding `12px 24px`, font `14px` weight 600
- **Secondary**: Transparent background, `1px solid var(--border)`, pill-shaped, secondary text color
- **Hover**: Scale to `1.02`, brightness increase, `200ms` transition
- **Active**: Scale to `0.97` (satisfying press feedback)
- **Shadow**: `var(--shadow-button)` on primary buttons only

#### Effects & Animations

**Shadows**
- **Card shadow**: `0 2px 12px rgba(0, 0, 0, 0.06)` — subtle, barely there
- **Elevated shadow**: `0 8px 24px rgba(0, 0, 0, 0.08)` — for hover states or emphasis
- **Button shadow**: `0 1px 3px rgba(0, 0, 0, 0.1)` — minimal depth
- **No shadow in dark mode** — use borders instead for definition

**Transitions**
- **Default duration**: `200ms`
- **Default easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Bouncy interactions**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for satisfying micro-interactions (e.g., score bounce)
- **Page entrance**: Fade in + slight upward slide (`20px` over `400ms`)
- **Section stagger**: Each section fades in sequentially with `100ms` delay between them

**Micro-interactions**
- **Score reveal**: Number counts up from 0 to final score over `800ms`
- **Progress bars**: Width animates from 0 to target over `600ms` with ease-out
- **Card hover**: `transform: scale(1.01)` + subtle shadow increase, `200ms` transition
- **Button press**: `transform: scale(0.97)` on `:active`
- **Link hover**: Underline appears with `200ms` transition, color shifts to accent
- **Expand/collapse**: Smooth height transition `300ms` ease-out

#### Responsive Behavior
| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | `< 640px` | Single column, full-width cards, `24px` page padding, score gauge `120px`, stacked skill cards |
| Tablet | `640px - 1024px` | 2-column skill grid possible, `48px` page padding |
| Desktop | `> 1024px` | Full layout, `64px` page padding, max-width `1200px`, side-by-side score + breakdown |

**Mobile-specific:**
- Score gauge moves to top-center, full width
- Skill cards stack vertically with `12px` gap
- Question review items are always collapsed by default (tap to expand)
- Footer CTAs become full-width stacked buttons

#### Print Styles
```css
@media print {
  body {
    background: #FFFFFF !important;
    color: #1D1D1F !important;
  }
  .card, .skill-card, .insight-card, .rec-card {
    box-shadow: none !important;
    border: 1px solid #E5E5EA !important;
    break-inside: avoid;
  }
  .no-print { display: none !important; }
  a { text-decoration: none !important; color: #1D1D1F !important; }
  @page { margin: 20mm; size: A4; }
}
```

#### Accessibility
- **Contrast ratios**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **Focus indicators**: `2px solid var(--accent)` outline, `2px` offset, visible on all interactive elements
- **Touch targets**: Minimum `44px × 44px` for any clickable element
- **Reduced motion**: Respect `prefers-reduced-motion` — disable counting animations, bouncy effects, and page slide-ins; keep simple opacity fades only
- **Semantic HTML**: Proper heading hierarchy (`h1` → `h2` → `h3`), `section` tags with `aria-label`, `button` for all interactive actions
- **Screen readers**: Score announced as "Overall score: 78 out of 100, Developing"; status icons have `aria-label`
- **Language**: `lang="zh-CN"` or `lang="zh-TW"` on Chinese text segments; `lang="en"` on English instructional text

#### Iconography
- **Style**: Rounded, soft, minimal line icons (2px stroke)
- **Library**: Inline SVG preferred; Phosphor Icons or Feather Icons style
- **Size**: `20px` to `24px` standard, `16px` for inline metadata
- **Color**: Inherit from text color or match section accent color
- **No emojis as sole indicators** — always pair with text labels or `aria-label` for accessibility; emojis are decorative enhancement only
---------|-------|
| **Typography** | System fonts (Inter/SF Pro), 16px base, generous line height |
| **Color scheme** | Light mode default; accent color #2563EB (blue) for links and highlights |
| **Score gauge** | SVG circular progress with gradient fill based on score |
| **Skill cards** | White cards with subtle shadow, colored left border by status |
| **Priority cards** | Left border color: red (high), yellow (medium), green (low) |
| **Responsive** | Mobile-first; stacks vertically on screens < 768px |
| **Print styles** | Optimized for A4 printing; page breaks between sections |
| **Dark mode** | `@media (prefers-color-scheme: dark)` support |

---

## Technical Requirements

### Frontend Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 18+ or Vue 3+ | Component-based UI |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **State Management** | Zustand / Pinia | Session state, user progress |
| **Audio** | Web Audio API + Howler.js | Recording and playback |
| **Canvas** | HTML5 Canvas API | Character writing input |
| **File Handling** | react-dropzone | Drag-and-drop uploads |
| **Charts** | Chart.js or D3.js | Score visualizations |

### Backend / AI Integration
| Component | Requirement |
|-----------|-------------|
| **File parser** | Extract text from PDF, DOCX, EPUB; extract audio metadata |
| **Curriculum engine** | Parse `mandarin-teacher-curriculum.md` to determine module alignment and question types |
| **Question generator** | AI generates listening questions, reading passages, writing prompts based on uploaded materials |
| **Speech assessment** | AI evaluates tone accuracy, pronunciation, fluency from audio recordings |
| **Writing assessment** | AI evaluates stroke order (from image), grammar, vocabulary usage (from text) |
| **Report generator** | Compile scores, insights, and recommendations into standalone HTML file |

### Data Storage
| Data | Storage | Persistence |
|------|---------|-------------|
| Uploaded files | Local filesystem (`_context/`) | Permanent until deleted |
| Session progress | LocalStorage / IndexedDB | Survives browser refresh |
| Session history | JSON files in `_context/sessions/` | Permanent record |
| User preferences | LocalStorage | Device-specific |

### Browser Compatibility
| Feature | Minimum Support |
|---------|-----------------|
| **Core functionality** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Audio recording** | Chrome, Firefox, Edge (Safari limited) |
| **File System Access API** | Chrome 86+ (for native folder picker) |
| **Mobile support** | iOS Safari 14+, Chrome Android 90+ |

---

## Error Handling & Edge Cases

### File System Errors
| Scenario | Handling |
|----------|----------|
| `_context/` folder missing | Display setup wizard with instructions to create folder and sample structure |
| `master/` folder empty | Allow session generation from supporting materials only; warn that curriculum alignment may be less accurate |
| Corrupted PDF | Skip file, display warning, offer re-upload |
| Unsupported audio codec | Convert server-side or display "playback not supported" with transcript fallback |
| Day folder gap (Day 1, Day 3, no Day 2) | Warn user; offer to create empty Day 2 or proceed with gap |

### Session Errors
| Scenario | Handling |
|----------|----------|
| Browser loses audio permission | Display permission guide; offer text-based alternative for speaking section |
| Recording fails | Allow file upload fallback; auto-save partial recording if possible |
| Canvas drawing not working | Offer text input alternative for writing section |
| Session timeout (inactive > 30 min) | Auto-save state; prompt to resume or restart |
| AI generation fails | Display "manual mode" with template questions based on curriculum |

### Result Errors
| Scenario | Handling |
|----------|----------|
| HTML generation fails | Display inline results page (non-downloadable); offer retry |
| Score calculation inconsistency | Log error, display best-effort score with "⚠️ partial assessment" warning |
| Missing previous session data | Omit trend analysis; focus on current session only |

---

## Security & Privacy

### Data Handling
- **All files remain local** — no cloud upload required; system operates entirely on user's device
- **Optional cloud sync** — if implemented, encrypt files at rest (AES-256)
- **Audio recordings** — stored locally; user can delete permanently at any time
- **Session reports** — HTML files contain no personally identifiable information by default

### Permissions
- **File system access** — Requires user explicit folder selection via native picker
- **Microphone access** — Requested only when entering speaking section; can be denied with fallback
- **No tracking** — No analytics, cookies, or external requests without explicit consent

---

## Future Enhancement Roadmap

### Phase 2 (Next Release)
- [ ] **Peer review mode** — Share session link with tutor for human feedback overlay
- [ ] **HSK exam simulation** — Generate full mock HSK 1–4 exams with timed conditions
- [ ] **Speech shadowing** — AI compares learner's audio to native speaker waveform
- [ ] **Character recognition from photo** — Upload any Chinese text image for instant reading practice

### Phase 3 (Future)
- [ ] **Spaced repetition integration** — Auto-generate flashcard decks from weak areas
- [ ] **Video comprehension** — Support video files with subtitle-based questions
- [ ] **Live conversation AI** — Real-time dialogue practice with AI conversation partner
- [ ] **Progress certificate** — Generate printable completion certificates per module

---

*Specification Version: 1.0*
*Designed for: Remote Mandarin learners using self-uploaded materials*
*Curriculum Reference: mandarin-teacher-curriculum.md*
*Last Updated: May 2026*
