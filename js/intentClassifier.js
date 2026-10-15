// Smart Intent Classifier: separates chitchat/general greetings vs document-grounded inquiries
(function () {
  const GREETING_REGEX = /^(hello|hi|hey|heyy|greetings|howdy|good\s+(morning|afternoon|evening|day)|sup|yo|halo|hai|selamat\s+(pagi|siang|sore|malam)|assalamu['\s]?alaikum|pagi|siang|sore|malam)\b/i;
  const GRATITUDE_REGEX = /^(thank\s+you|thanks|thx|ty|many\s+thanks|i\s+appreciate\s+it|appreciate\s+it|thank\s+you\s+so\s+much|terima\s+kasih|makasih|matur\s+nuwun|nuhun|terimakasih|makasi|tq|thanks\s+ya)\b/i;
  const IDENTITY_REGEX = /^(who\s+are\s+you|what\s+can\s+you\s+do|introduce\s+yourself|what\s+is\s+your\s+name|what\s+are\s+you|help(\s+me)?|siapa\s+kamu|apa\s+yang\s+bisa\s+kamu\s+lakukan|perkenalkan\s+dirimu|kamu\s+siapa|bantuan|fitur\s+apa\s+saja)\b/i;
  const FAREWELL_REGEX = /^(bye|goodbye|see\s+you|have\s+a\s+good\s+day|cya|take\s+care|sampai\s+jumpa|dadah|selamat\s+tinggal|bye\s+bye|pamit)\b/i;
  const SMALLTALK_REGEX = /^(how\s+are\s+you|tell\s+me\s+a\s+joke|are\s+you\s+(real|human|ai)|apa\s+kabar|bagaimana\s+kabarmu|ceritakan\s+lelucon|kamu\s+hebat|mantap|keren|cool|awesome|great\s+job)\b/i;

  const SUMMARY_REGEX = /(summarize|summary|overview|brief|recap|tldr|key\s+takeaways|main\s+points|ringkas|rangkum|ringkasan|rangkuman|garis\s+besar|poin\s+penting|kesimpulan)/i;
  const QUIZ_REGEX = /(quiz|test\s+me|practice\s+questions|exam\s+questions|flashcards|multiple\s+choice|kuis|tes\s+saya|soal\s+latihan|pertanyaan\s+latihan|pilihan\s+ganda)/i;

  function classifyPrompt(prompt, activeDocuments = []) {
    const clean = prompt.trim();
    const lower = clean.toLowerCase();
    const promptTokens = window.DocumentParser ? window.DocumentParser.tokenize(clean) : clean.toLowerCase().split(/\s+/);

    // 1. Check for pure greetings (under 50 chars)
    if (clean.length < 50 && GREETING_REGEX.test(lower)) {
      return {
        type: 'CHITCHAT',
        subType: 'GREETING',
        isDocumentRelated: false,
        confidence: 0.98,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'Basic Greeting detected — friendly conversational reply generated without document search.',
        badgeText: '💬 Conversational Greeting',
        badgeClass: 'badge-chitchat'
      };
    }

    // 2. Check for gratitude
    if (clean.length < 60 && GRATITUDE_REGEX.test(lower)) {
      return {
        type: 'CHITCHAT',
        subType: 'GRATITUDE',
        isDocumentRelated: false,
        confidence: 0.98,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'Polite gratitude detected — warm courteous reply.',
        badgeText: '🙏 Polite Banter',
        badgeClass: 'badge-chitchat'
      };
    }

    // 3. Check for identity/help queries
    if (clean.length < 75 && IDENTITY_REGEX.test(lower)) {
      return {
        type: 'CHITCHAT',
        subType: 'IDENTITY',
        isDocumentRelated: false,
        confidence: 0.95,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'Assistant identity or capability inquiry.',
        badgeText: '🤖 Assistant Info',
        badgeClass: 'badge-chitchat'
      };
    }

    // 4. Check for farewell
    if (clean.length < 40 && FAREWELL_REGEX.test(lower)) {
      return {
        type: 'CHITCHAT',
        subType: 'FAREWELL',
        isDocumentRelated: false,
        confidence: 0.98,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'Farewell detected.',
        badgeText: '👋 Farewell',
        badgeClass: 'badge-chitchat'
      };
    }

    // 5. Check for small talk
    if (clean.length < 50 && SMALLTALK_REGEX.test(lower)) {
      return {
        type: 'CHITCHAT',
        subType: 'SMALLTALK',
        isDocumentRelated: false,
        confidence: 0.90,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'Casual small talk detected.',
        badgeText: '💬 Casual Chat',
        badgeClass: 'badge-chitchat'
      };
    }

    // If no document is currently uploaded, determine if asking for file summary or general knowledge
    if (!activeDocuments || activeDocuments.length === 0) {
      const explicitlyAskingForFile = /(?:in the|from the|summarize the|ringkas)\s+(?:uploaded|file|document|pdf|dokumen)/i.test(lower);
      if (explicitlyAskingForFile) {
        return {
          type: 'DOCUMENT_NEEDED',
          subType: 'NO_DOCS',
          isDocumentRelated: true,
          confidence: 0.85,
          matchedKeywords: [],
          matchedTopics: [],
          reason: 'User requested summary of an uploaded file, but no file is currently uploaded.',
          badgeText: '⚠️ File Needed',
          badgeClass: 'badge-warning'
        };
      }

      return {
        type: 'GENERAL_KNOWLEDGE',
        subType: 'GENERAL',
        isDocumentRelated: false,
        confidence: 0.85,
        matchedKeywords: [],
        matchedTopics: [],
        reason: 'General knowledge / reasoning inquiry — answered using AI knowledge base without document retrieval.',
        badgeText: '💡 General Knowledge',
        badgeClass: 'badge-chitchat'
      };
    }

    // 6. Check for Document Summary request
    if (SUMMARY_REGEX.test(lower)) {
      return {
        type: 'DOCUMENT_SUMMARY',
        subType: 'SUMMARY',
        isDocumentRelated: true,
        confidence: 0.95,
        matchedKeywords: [],
        matchedTopics: activeDocuments[0]?.keyTopics?.slice(0, 4) || [],
        reason: 'Requesting comprehensive summary and key takeaways of the uploaded document.',
        badgeText: '📋 Document Summary',
        badgeClass: 'badge-doc'
      };
    }

    // 7. Check for Quiz / Practice test request
    if (QUIZ_REGEX.test(lower)) {
      return {
        type: 'DOCUMENT_QUIZ',
        subType: 'QUIZ',
        isDocumentRelated: true,
        confidence: 0.92,
        matchedKeywords: [],
        matchedTopics: activeDocuments[0]?.keyTopics?.slice(0, 4) || [],
        reason: 'Requesting practice quiz generated directly from the study material.',
        badgeText: '🧠 Material Quiz',
        badgeClass: 'badge-doc'
      };
    }

    // 8. Keyword & Topic Matcher: Inspect if the user's prompt mentions important keywords from the files given
    const matchedTopics = [];
    const matchedKeywords = [];

    // Check all active documents
    for (const doc of activeDocuments) {
      // Check Topics
      if (doc.keyTopics) {
        for (const topic of doc.keyTopics) {
          const cleanTopic = topic.toLowerCase();
          if (lower.includes(cleanTopic) || promptTokens.includes(cleanTopic)) {
            if (!matchedTopics.includes(topic)) {
              matchedTopics.push(topic);
            }
          }
        }
      }

      // Check Chunks tokens
      const docVocab = new Set();
      if (doc.chunks) {
        for (const ch of doc.chunks) {
          for (const tk of ch.tokens) {
            docVocab.add(tk);
          }
        }
      }

      for (const pt of promptTokens) {
        if (docVocab.has(pt) && !matchedKeywords.includes(pt)) {
          matchedKeywords.push(pt);
        }
      }
    }

    // If prompt mentions key topics or 2+ domain keywords from the file
    if (matchedTopics.length > 0 || matchedKeywords.length >= 2) {
      const topicLabel = matchedTopics.length > 0 
        ? `topic: "${matchedTopics.slice(0, 2).join(', ')}"` 
        : `keywords: "${matchedKeywords.slice(0, 3).join(', ')}"`;

      return {
        type: 'DOCUMENT_GROUNDED',
        subType: 'TOPIC_QUERY',
        isDocumentRelated: true,
        confidence: Math.min(0.98, 0.7 + matchedKeywords.length * 0.1),
        matchedKeywords,
        matchedTopics,
        reason: `Matched file ${topicLabel} — extracting targeted answer and citations from material.`,
        badgeText: `📄 Grounded (${matchedKeywords.length} keywords matched)`,
        badgeClass: 'badge-doc'
      };
    }

    // Check for educational question patterns ("what is", "how does", "explain", "jelaskan", "mengapa")
    const isExplainingQuery = /^(what|why|how|explain|describe|define|where|when|jelaskan|apa|bagaimana|mengapa|sebutkan)\b/i.test(lower);
    if (isExplainingQuery && matchedKeywords.length >= 1) {
      return {
        type: 'DOCUMENT_GROUNDED',
        subType: 'QUESTION',
        isDocumentRelated: true,
        confidence: 0.82,
        matchedKeywords,
        matchedTopics,
        reason: `Study question related to term "${matchedKeywords[0]}" found in the uploaded material.`,
        badgeText: '📄 Document Q&A',
        badgeClass: 'badge-doc'
      };
    }

    // Fallback: general chat
    return {
      type: 'CHITCHAT',
      subType: 'GENERAL',
      isDocumentRelated: false,
      confidence: 0.70,
      matchedKeywords: [],
      matchedTopics: [],
      reason: 'General inquiry not directly matching specific keywords in the uploaded material.',
      badgeText: '💬 General Query',
      badgeClass: 'badge-chitchat'
    };
  }

  window.IntentClassifier = {
    classifyPrompt
  };
})();
