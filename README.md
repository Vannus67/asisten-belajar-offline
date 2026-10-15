# AURA — Offline Browser AI Assistant (HTML, JavaScript, CSS)

A powerful, 100% offline personal AI study assistant that runs entirely inside your web browser using pure **HTML5, Vanilla JavaScript, and CSS**. Zero servers, zero cloud APIs, and zero data leaves your machine.

---

## ✨ Upgraded Features & Capabilities

1. **🧠 Autonomous Thinking & General Knowledge (Not Just Word Matching)**:
   - Does **not** merely count word frequencies or copy-paste text!
   - Can think and answer prompts that have **nothing to do with uploaded files**:
     - 🧮 **Math & Calculations**: Evaluates arithmetic, percentages, and formulas (e.g., *"Berapa 125 * 8?"*).
     - 🌌 **General Science**: Answers physics, chemistry, biology, astronomy (e.g., *"Jelaskan apa itu gravitasi secara sederhana"*).
     - 💻 **Programming & Tech**: Explains JavaScript, Python, SQL, web development with syntax-highlighted code blocks.
     - 📜 **Creative & Advice**: Writes poems, study tips, time-management techniques, and jokes.

2. **📂 Universal File Support (Reads All Kinds of Files)**:
   - 📕 **PDF Documents** (`.pdf`): Multi-page text extraction with page-aware citations using standalone Mozilla PDF.js.
   - 📘 **Word Documents** (`.docx`): Extracted using standalone Mammoth.
   - 📊 **Spreadsheets & Tables** (`.csv`, `.tsv`): Formats tabular rows and column definitions.
   - 🗄️ **Structured Data** (`.json`): Formats objects and datasets into readable insights.
   - 💻 **Source Code** (`.js`, `.ts`, `.py`, `.html`, `.css`, `.sql`, etc.): Identifies functions, classes, and logic.
   - 📝 **Notes & Prose** (`.txt`, `.md`, `.rtf`).

3. **🗣️ Semantic Synthesis in Its Own Words**:
   - Rather than copy-pasting raw sentences from uploaded modules, the AI synthesizes:
     - 💡 **Intuitive Concept Breakdown**: Explains the core idea in conversational, natural language.
     - 🔍 **Key Principles**: Restructured, easy-to-understand bullet points.
     - 🌟 **Real-World Significance**: Explains why the concept matters.
     - 📌 **Exact Source Citations**: Links to the exact page and section.

4. **💭 Conversational Memory**:
   - Remembers user context and previous conversation turns:
     - *"Nama saya Alex"* &rarr; remembers your name (*"Siapa nama saya?"*).
     - *"Apa pertanyaan saya sebelumnya?"* &rarr; recalls what you asked earlier.
     - *"Jelaskan lebih lanjut poin kedua tadi"* &rarr; dives deeper into the specific point from its previous answer.
     - *"Rangkum percakapan kita sejauh ini"* &rarr; recaps all topics discussed.

5. **🎯 Interactive Quiz Studio Tab**:
   - Click the **"Quiz Studio"** tab at the top of the app to generate quizzes directly from any uploaded document!
   - **Custom Configuration**: Select question count (3, 5, 10), style (Multiple Choice, True/False, Mixed), and focus topic.
   - **Interactive Testing**: Click options (A, B, C, D), get instant color-coded feedback (Green/Red), and see explanations grounded in the source text.
   - **Score Tracker & Review**: Displays final score, percentage, and option to retake or configure a new quiz.

6. **🇮🇩 / 🇬🇧 Bilingual Comprehension**:
   - Seamlessly understands and responds to instructions in both **Indonesian** and **English** (e.g. *"jelaskan secara santai"*, *"buatkan kuis"*, *"berikan contoh nyata"*, *"simplify this"*, *"compare X and Y"*).

---

## 🚀 How to Run

### Option 1: Double-Click `index.html` (Zero Installation)
Simply double-click `index.html` in your file explorer to open it directly in Chrome, Edge, Firefox, or Safari!

### Option 2: Local Static Server (Optional)
```bash
node server.js
```
Then navigate to:
```
http://127.0.0.1:3000
```

---

## 📁 Project Architecture

```
asisten-belajar-offline/
├── index.html                   # Pure HTML5 layout with Chat & Quiz Studio tabs
├── style.css                    # Modern CSS design system (Dark/Light mode)
├── server.js                    # Zero-dependency local static server
├── Sample_Biology_Photosynthesis.pdf # Multi-page test PDF
├── js/
│   ├── app.js                   # UI controller, tab switching, & state events
│   ├── studyAssistant.js        # Autonomous reasoning, memory, & synthesis engine
│   ├── quizEngine.js            # Interactive Quiz Studio generator & scoring
│   ├── intentClassifier.js      # Smart routing between general chat & document RAG
│   ├── retrievalEngine.js       # In-browser BM25 semantic retrieval
│   ├── documentParser.js        # Universal reader (PDF, DOCX, CSV, JSON, Code, Text)
│   └── sampleData.js            # Built-in study materials
└── lib/
    ├── pdf.min.js               # Standalone PDF.js library
    ├── pdf.worker.js            # Standalone PDF.js worker
    └── mammoth.browser.min.js   # Standalone DOCX parser
```
