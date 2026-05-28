# 🀄 Mandarin Mastery Review System

> **Your personal Mandarin Chinese tutor — powered by AI, kept private on your own computer.**

---

## 📖 What Is This?

This is a **free desktop app** that helps you review and practice Mandarin Chinese using **your own textbooks, class photos, and workbook exercises**.

Instead of generic flashcard apps, this system:
- 📚 **Reads your actual learning materials** (textbooks, workbooks, daily class notes)
- 🎯 **Creates personalized review quizzes** based on what you've studied
- ✍️ **Tests speaking, reading, and writing** with interactive exercises
- 📊 **Gives you a scored report** after each session so you know what to improve
- 🔒 **Keeps everything on your computer** — your materials never leave your device

Think of it as a smart tutor that knows exactly what you studied in class and builds the perfect review session for you.

---

## 👤 Who Is This For?

This app is designed for **remote Mandarin learners** who:

- Have physical or digital textbooks and workbooks
- Receive daily learning materials (class photos, screenshots, video recordings)
- Want structured review sessions that match their actual curriculum
- Prefer to keep their learning materials private
- Study with a teacher or course that follows a 12-module progression

---

## 🖥️ What You Need

Before starting, make sure you have:

| Requirement | What It Is | How to Check |
|------------|-----------|--------------|
| **A computer** (Mac, Windows, or Linux) | This app runs in your web browser | You have one right now! |
| **Google Chrome, Safari, or Firefox** | A modern web browser | Open any website — if it works, you're good |
| **Your Mandarin materials** | Textbooks, workbooks, class photos, videos | Gathered in one folder |
| **A Google Gemini API key** *(optional)* | A free code from Google that lets the AI generate questions | See setup instructions below |

> 💡 **No API key?** The app can still generate **demo questions** without one. You just won't get questions tailored to your specific materials.

---

## 📁 Your Folder Setup

The app expects your learning materials in a specific folder structure. Don't worry — you only need to set this up **once**.

Create a folder named `_context` on your computer with this structure:

```
_context/
├── master/                          ← Your main textbook & workbook PDFs
│   ├── 初级上 (Textbook Sesi 1).pdf
│   ├── 初级上（Workbook Sesi 1).pdf
│   └── ... (any other textbook/workbook files)
│
└── supporting/                      ← Your daily class materials
    ├── Day 1/
    │   ├── WhatsApp Image 2026-02-03.jpeg
    │   ├── 1. 3 Februari 2026.mp4
    │   └── ... (photos, screenshots, videos from that day)
    ├── Day 2/
    │   └── ...
    └── Day 3/
        └── ...
```

### Simple Rules:

1. **Textbooks and workbooks** go in `master/`
2. **Daily materials** go in folders named exactly `Day 1`, `Day 2`, `Day 3`, etc.
3. **Any file type works**: PDF, JPG, PNG, MP4, MP3, TXT
4. **You can add up to 365 days** (one full year)

---

## 🚀 How to Set Up the App

### Step 1: Download This Project

Download this folder to your computer and remember where you saved it (for example: `Documents/mandarin-course/`).

### Step 2: Install the Frontend (The Web App)

The frontend is the visual part you click and interact with.

**On Mac:**
1. Open the app called **Terminal** (search for it in Spotlight)
2. Type this and press Enter:
   ```bash
   cd Documents/mandarin-course/_webapp
   ```
   *(If you saved it somewhere else, replace `Documents/mandarin-course` with your path)*
3. Type this and press Enter:
   ```bash
   npm install
   ```
   This downloads the app's building blocks. It may take 1–2 minutes.

**On Windows:**
1. Open **Command Prompt** or **PowerShell**
2. Type:
   ```bash
   cd C:\Users\YourName\Documents\mandarin-course\_webapp
   ```
3. Type:
   ```bash
   npm install
   ```

### Step 3: Install the Backend (The AI Brain)

The backend is what reads your materials and creates questions.

**On Mac:**
1. In Terminal, go to the backend folder:
   ```bash
   cd Documents/mandarin-course/_backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate it:
   ```bash
   source venv/bin/activate
   ```
   *(You should see `(venv)` appear at the start of your prompt)*
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

**On Windows:**
1. In Command Prompt:
   ```bash
   cd C:\Users\YourName\Documents\mandarin-course\_backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate it:
   ```bash
   venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Step 4: Set Up Your API Key (Optional but Recommended)

If you want **AI-generated questions tailored to your materials**, you need a free API key from Google Gemini.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the long code that looks like `AIzaSy...`
5. In the `_backend` folder, find the file called `.env.example`
6. Make a copy of it named `.env`
7. Open `.env` in any text editor (like Notepad or TextEdit)
8. Replace `your_gemini_api_key_here` with your actual key:
   ```
   AI_PROVIDER=gemini
   AI_MODEL=gemini-2.5-pro
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
9. Save the file

> 🔑 **Keep this key private.** Never share your `.env` file with anyone.

---

## ▶️ How to Run the App

Every time you want to study, you need to start **two things**: the backend and the frontend.

### Terminal 1 — Start the Backend

```bash
cd Documents/mandarin-course/_backend
source venv/bin/activate   # Mac
venv\Scripts\activate      # Windows
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://localhost:8000
```

**Leave this window open.** This is your AI brain running in the background.

### Terminal 2 — Start the Frontend

Open a **second** Terminal/Command Prompt window:

```bash
cd Documents/mandarin-course/_webapp
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

### Open the App

Click the link (`http://localhost:5173/`) or type it into your web browser. The app will open!

---

## 🎓 How to Use the App

### 1. Scan Your Materials

When you first open the app:

1. Click **"Material Manager"**
2. Click **"Select _context Folder"**
3. Choose your `_context` folder
4. The app will scan and show you all your textbooks, workbooks, and daily materials

> 💡 **Tip:** Do this once at the beginning. If you add new days later, just scan again.

### 2. Generate a Review Session

1. Click **"Generate Review Session"**
2. **Step 1:** Select which textbooks/workbooks to include
3. **Step 2:** Select which days of class materials to review
4. **Step 3:** Choose what skills to practice (speaking, reading, writing) and set difficulty
5. Click **"Generate Session"**
6. Wait 10–30 seconds while the AI reads your materials and creates questions

### 3. Review Your Summary

Before the quiz starts, you'll see a **summary screen** showing:
- Which materials are included
- How many questions of each type
- Estimated time

Click **"Start Quiz"** when you're ready.

### 4. Answer Questions

The app will guide you through one question at a time:

| Question Type | How You Answer |
|--------------|----------------|
| 🎤 **Speaking** | Read the prompt aloud (optional: record yourself) |
| 📖 **Reading** | Read a Chinese passage, then pick the correct multiple-choice answer |
| ✍️ **Character Writing** | Draw the Chinese character in the grid using your mouse or trackpad |
| 📝 **Essay** | Type a short essay in Chinese (150–200 characters) |

Click **"Submit"** after each answer. You'll immediately see:
- Whether your answer was correct
- The correct answer
- An explanation to help you learn

Click **"Continue"** to move to the next question.

### 5. View Your Report

After the last question, click **"View Results"** to see:
- Your overall score
- Breakdown by skill (speaking, reading, writing)
- Specific feedback on each question
- Recommendations for what to study next

You can also **download the report as an HTML file** to keep or share with your teacher.

---

## 📊 Understanding Your Scores

| Score | What It Means |
|-------|--------------|
| **90–100** 🟢 | Excellent — You've mastered this material |
| **80–89** 🟢 | Proficient — Strong understanding, minor gaps |
| **70–79** 🟡 | Developing — Good effort, review recommended |
| **Below 70** 🔴 | Needs Support — Focus on fundamentals |

> 🎯 **Goal:** Aim for 80%+ to stay on track with your curriculum.

---

## 🔒 Privacy & Security

Your privacy is built into the design:

- ✅ **All files stay on your computer** — nothing uploads to the cloud unless you explicitly configure it
- ✅ **Your API key is stored only in a local file** (`_backend/.env`) that is never shared
- ✅ **Audio recordings** are stored locally and can be deleted anytime
- ✅ **No tracking or analytics** — the app does not send usage data anywhere
- ✅ **Reports are HTML files on your device** — not stored on any server

The only external connection is to Google's AI service **when generating questions** (if you provided an API key). Your materials are sent to Google **only during question generation**, and only the text/images needed to create questions — never your full files.

---

## 🆘 Troubleshooting

### "No Active Session" appears
You haven't generated a session yet. Go to **Material Manager** first, then **Generate Review Session**.

### "AI backend is not configured" error
Your API key is missing or incorrect. Check your `_backend/.env` file and make sure `GEMINI_API_KEY` is filled in.

### The canvas doesn't let me draw
Make sure you're using **Google Chrome** or **Safari**. Firefox may have limited touch support. Click and drag with your mouse, or use a trackpad/stylus.

### Questions seem generic, not from my materials
Either:
- You haven't set up an API key (demo questions are generic)
- The backend isn't running (check Terminal 1)
- Your `_context` folder is empty or in the wrong place

### "Folder access was cancelled" in Material Manager
On Safari or Firefox, use the **fallback upload button** instead of the folder picker. Chrome/Edge users should use the native folder picker.

### Backend won't start
Make sure you:
1. Activated the virtual environment (`source venv/bin/activate`)
2. Installed requirements (`pip install -r requirements.txt`)
3. Are in the `_backend` folder

---

## 🗂️ Project Structure (Simple Version)

```
.
├── _context/                 ← YOUR learning materials (ignored by Git)
│   ├── master/               ← Textbooks & workbooks
│   └── supporting/           ← Daily class materials (Day 1, Day 2, ...)
│
├── _instructions/            ← App design documents (for developers)
├── _webapp/                  ← The visual app you interact with
│   ├── src/
│   │   ├── views/            ← Screens (Dashboard, Quiz, Report)
│   │   ├── components/       ← Reusable pieces (Navigation bar)
│   │   └── utils/            ← Helpers that build your report
│   └── package.json          ← List of frontend tools
│
├── _backend/                 ← The AI brain that reads your materials
│   ├── main.py               ← Main server file
│   ├── services/             ← AI question generator, PDF reader
│   ├── prompts/              ← Instructions given to the AI
│   ├── requirements.txt      ← List of backend tools
│   └── .env                  ← YOUR API key (keep secret!)
│
├── README.md                 ← This file
└── dev-mistakes.md           ← Lessons learned by developers
```

---

## 🙋 Frequently Asked Questions

**Q: Do I need to know how to code?**
A: No! You only need to copy-paste a few commands into Terminal/Command Prompt. The app itself is all point-and-click.

**Q: Can I use this without an internet connection?**
A: Partially. Once the app is running, the quiz itself works offline. But generating new questions requires an internet connection to reach Google's AI.

**Q: Can I use a different AI instead of Google Gemini?**
A: Yes! The app also supports Moonshot AI and OpenAI. Change the `AI_PROVIDER` and `AI_MODEL` in your `_backend/.env` file.

**Q: What if my textbook is in Indonesian/Chinese?**
A: The app is designed for mixed-language materials. It reads text from PDFs and uses image filenames for context, regardless of language.

**Q: Can I share this with my classmates?**
A: Yes! The code is free to share. Each person needs their own `_context` folder with their own materials and their own API key.

**Q: Will this work on my iPad or phone?**
A: The app is designed for desktop/laptop computers. Mobile support is limited.

---

## 🛠️ Built With

| Part | Technology | What It Does |
|------|-----------|--------------|
| Frontend | React + TypeScript | The clickable interface you see |
| Styling | Tailwind CSS | Makes everything look clean and modern |
| Backend | Python + FastAPI | Reads your materials and talks to the AI |
| AI | Google Gemini | Generates personalized questions |
| PDF Reading | PyMuPDF | Extracts text from your textbook PDFs |
| Storage | Your computer | All files stay local |

---

## 📝 License

This project is for personal educational use. All learning materials in `_context/` belong to you and are never shared.

---

## 💬 Need Help?

If something isn't working:
1. Check the **Troubleshooting** section above
2. Look at `dev-mistakes.md` for known issues and fixes
3. Make sure both the backend and frontend are running
4. Try refreshing the browser with **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

---

*Happy studying! 加油 (jiāyóu)!* 🀄
