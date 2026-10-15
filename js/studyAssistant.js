// Enhanced Human-Like AI Assistant with Distinct Attitudes, Natural Speech, and Zero Copy-Pasting
(function () {
  // Attitude options: 'sassy' (default), 'chill', 'coach'
  let currentAttitude = (typeof localStorage !== 'undefined' ? localStorage.getItem('aura_attitude') : null) || 'sassy';

  // Conversational Memory Store
  const memory = {
    userName: null,
    chatHistory: [],
    lastTopic: null,
    lastPoints: []
  };

  function setAttitude(att) {
    if (['sassy', 'chill', 'coach'].includes(att)) {
      currentAttitude = att;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aura_attitude', att);
      }
    }
  }

  function getAttitude() {
    return currentAttitude;
  }

  function recordMemory(role, content) {
    if (role === 'user') {
      const nameMatch = content.match(/(?:my name is|i am|nama saya|panggil saya|aku|gw|gua)\s+([A-Z][a-zA-Z0-9_]+)/i);
      if (nameMatch && nameMatch[1]) {
        memory.userName = nameMatch[1];
      }
    }

    const entry = { role, content, timestamp: Date.now() };
    if (role === 'assistant') {
      const bulletMatches = content.match(/(?:^|\n)\s*[-*•\d+.]\s*([^\n]+)/g) || [];
      memory.lastPoints = bulletMatches.map((b) => b.replace(/^\s*[-*•\d+.]\s*/, '').trim());
    }

    memory.chatHistory.push(entry);
    if (memory.chatHistory.length > 50) memory.chatHistory.shift();
  }

  function clearMemory() {
    memory.userName = null;
    memory.chatHistory = [];
    memory.lastTopic = null;
    memory.lastPoints = [];
  }

  function isIndonesian(text) {
    return /\b(yang|dan|di|dari|ini|itu|adalah|untuk|pada|ke|karena|apa|bagaimana|gimana|mengapa|kenapa|siapa|tolong|jelaskan|buatkan|ringkas|kamu|saya|kita|terima\s+kasih|halo|selamat|males|pusing|bego|woy|lu|gw|gua|nggak|ngga|aja|nih|deh|dong|banget|gini|lho|kan|kok|daun|tumbuhan|warna|hijau|ceritanya|bisa|tadi|kemarin|besok|hari|soal|ngapain)\b/i.test(text);
  }

  // Conversational Openers & Personality Hooks
  function getPersonalityHooks(isIndo, type = 'intro') {
    const hooks = {
      sassy: {
        introIndo: [
          "Duh, santai elah! Nggak usah dibikin pusing sama bahasa buku yang sok formal.",
          "Jujur ya, ini sebenernya gampang banget kalo lu nggak overthinking.",
          "Lu pasti males baca modul yang panjang itu kan? Haha, yaudah dengerin nih:",
          "Oke, dengerin baik-baik biar lu nggak planga-plongo pas ditanya dosen/guru:",
          "To the point aja ya, nggak usah bertele-tele kayak slide kuliah lu:"
        ],
        introEng: [
          "Look, let's cut through the textbook fluff.",
          "Honestly, whoever wrote that section made it sound 10x harder than it actually is.",
          "No BS, here's what's actually happening without the academic jargon:",
          "Alright, buckle up. Here's the quick breakdown before your brain melts:",
          "Don't panic! It's actually way simpler than your professor made it seem."
        ],
        outroIndo: [
          "Gampang kan? Nggak usah ngafal kata per kata, yang penting paham logikanya! 😉",
          "Nah, sekarang lu udah lebih pinter dari 80% temen sekelas lu soal topik ini. Mantap kan?",
          "Udah, intinya cuma itu. Ada yang masih bikin lu bingung?"
        ],
        outroEng: [
          "See? Easy peasy once you strip away the pretentious vocabulary. 😉",
          "Boom. That's the whole magic. Don't overcomplicate it on your test!",
          "That's literally the whole core concept. What else is bugging you?"
        ]
      },
      chill: {
        introIndo: [
          "Santai sob, pelan-pelan ya. Wajar banget kok kalo materi ini rada tricky di awal.",
          "Tenang aja, bayanginnya santai kayak gini nih:",
          "Gini lho konsep dasarnya, gampang kok dipahami:"
        ],
        introEng: [
          "No stress at all! Everyone gets tripped up by this at first.",
          "Take a breath. Think of it like this friendly analogy:",
          "Here's the chill breakdown to wrap your head around:"
        ],
        outroIndo: [
          "Pelan-pelan aja belajarnya ya, lu pasti bisa kok!",
          "Gimana, udah mulai dapet 'klik'-nya belum?"
        ],
        outroEng: [
          "Take your time digesting that—you've got this!",
          "Hope that makes it feel much less intimidating!"
        ]
      },
      coach: {
        introIndo: [
          "Langsung ke sasaran. Ini poin krusial yang wajib lu kuasai:",
          "Fokus! Kuncinya cuma ada di satu mekanisme ini:",
          "Nggak usah buang waktu. Ini yang paling sering keluar di ujian:"
        ],
        introEng: [
          "Zero fluff, straight to business. Here is the bottom line:",
          "Lock in. This is the exact concept you need to master:",
          "Cut the distractions. Here's the core takeaway:"
        ],
        outroIndo: [
          "Inget prinsip ini baik-baik. Jangan sampai ketuker pas ujian!",
          "Catat poin itu. Itu pembeda antara nilai A sama nilai C!"
        ],
        outroEng: [
          "Burn that into your memory—it's high-yield test material.",
          "Master that single principle and the rest falls into place."
        ]
      }
    };

    const set = hooks[currentAttitude] || hooks.sassy;
    const pool = isIndo ? set[`${type}Indo`] : set[`${type}Eng`];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Handles natural human speech, slang, banter, and conversational questions
  function handleHumanDialogue(prompt, lower, isIndo) {
    // 1. Slang / Frustration ("gw pusing", "males", "i'm lost", "wtf", "nggak ngerti")
    if (/(pusing|males|bingung|nggak ngerti|ngga mudeng|mumet|lost|confused|frustrated|makes no sense|overwhelmed)/i.test(lower)) {
      if (isIndo) {
        return `${getPersonalityHooks(true, 'intro')}\n\nTarik napas dulu! Wajar kok kalo ngerasa pusing pas pertama baca materi ginian. Rahasianya: **jangan ngafalin semua teksnya**, tapi pahami satu konsep intinya aja dulu.\n\nCoba kasih tau gw bagian mana yang paling bikin lu pusing, biar gw bedah pake bahasa paling santai!`;
      }
      return `${getPersonalityHooks(false, 'intro')}\n\nTake a breath! It is completely normal to feel overwhelmed when textbooks drown you in jargon. The secret is **not memorizing the whole chapter**, but just grasping the central logic.\n\nTell me which specific line or term is driving you crazy, and I'll break it down like we're chatting over coffee!`;
    }

    // 2. Playful banter / Cheeky insults ("kamu bego", "you're dumb", "bot jelek", "sombong")
    if (/(bego|bodoh|goblok|jelek|dumb|stupid|useless|sassy|sombong)/i.test(lower)) {
      if (isIndo) {
        return `Wah, berani-beraninya ya! 😂 Gw ini AI yang jalan 100% lokal di browser lu tanpa internet sepeser pun, hemat kuota lu pula. Harusnya lu bersyukur gw bantuin belajar! Yaudah, mau nanya materi apa sekarang? Gw tunjukin seberapa pinter gw. 😉`;
      }
      return `Hey now, watch the attitude! 😂 I'm literally running 100% locally on your machine without consuming a single byte of internet. You should be buying me a virtual coffee! Now, drop your hardest study question and let me prove my worth. 😉`;
    }

    // 3. Conversational Memory: User's name
    if (/(who am i|what is my name|siapa saya|siapa nama saya|nama gw siapa)/i.test(lower)) {
      if (memory.userName) {
        return isIndo
          ? `Ya nama lu **${memory.userName}** lah! Masak lupa nama sendiri sih? Haha. Santai, memori gw masih tajem kok.`
          : `Your name is **${memory.userName}**, obviously! Did you bump your head or are you just testing me? My memory is sharp!`;
      }
      return isIndo
        ? `Lu belum ngasih tau nama lu ke gw! Coba bilang *"Nama saya [Nama lu]"*, nanti gw catet di memori lokal gw.`
        : `You haven't told me your name yet! Just hit me with *"My name is [Your Name]"*, and I'll keep it locked in memory.`;
    }

    // 4. Conversational Memory: Past questions
    if (/(what did i (ask|say)|what was my (last|previous) question|apa yang saya (tanyakan|katakan|bilang)|pertanyaan saya (sebelumnya|tadi|sebelum ini)|tanya apa (tadi|sebelumnya))/i.test(lower)) {
      const userMessages = memory.chatHistory.filter((m) => m.role === 'user');
      if (userMessages.length > 1) {
        const prev = userMessages[userMessages.length - 2].content;
        return isIndo
          ? `Tadi lu nanya ini nih:\n> *" ${prev} "*\n\nNgetes ingatan gw ya? Aman, gw inget semua yang lu omongin di sesi ini!`
          : `Earlier, you asked me this:\n> *" ${prev} "*\n\nTesting my memory, huh? Don't worry, I track every turn of our chat!`;
      }
      return isIndo ? "Ini pertanyaan pertama lu di sesi ini, boss!" : "This is literally your first question in this chat session!";
    }

    // 5. Conversational Memory: Recap
    if (/(summarize (our|the) conversation|rangkum percakapan kita|apa saja yang sudah kita bahas|recap)/i.test(lower)) {
      if (memory.chatHistory.length <= 2) {
        return isIndo
          ? "Percakapan kita baru mulai, belum ada yang perlu dirangkum! Ayo lempar materi atau pertanyaan dulu."
          : "We just started talking! There's barely anything to recap yet. Ask away!";
      }
      const questions = memory.chatHistory.filter((m) => m.role === 'user').map((m) => `- "${m.content}"`);
      return isIndo
        ? `Nih rekapan apa aja yang udah lu tanyain ke gw:\n\n${questions.join('\n')}\n\nGimana, mau kita lanjutin topik yang mana?`
        : `Here is the rundown of what you've quizzed me on so far:\n\n${questions.join('\n')}\n\nWhich one do you want to dig deeper into?`;
    }

    // 6. Deep dive on previous points ("jelaskan poin ke-2", "expand point 1")
    const pointMatch = lower.match(/(?:point|poin|nomor|number)\s*(?:ke-?)?(\d+|one|two|three|satu|dua|tiga)/i);
    if (pointMatch && memory.lastPoints.length > 0) {
      let idx = 0;
      const val = pointMatch[1].toLowerCase();
      if (val === '1' || val === 'one' || val === 'satu') idx = 0;
      else if (val === '2' || val === 'two' || val === 'dua') idx = 1;
      else if (val === '3' || val === 'three' || val === 'tiga') idx = 2;
      else idx = parseInt(val, 10) - 1;

      if (idx >= 0 && idx < memory.lastPoints.length) {
        const targetPoint = memory.lastPoints[idx];
        return isIndo
          ? `Oke, kita bedah lebih dalem poin #${idx + 1}: **"${targetPoint}"**.\n\n` +
            `Intinya begini: hal ini berperan sebagai katalis atau penggerak utama. Kalau bagian ini macet, seluruh sistem di atasnya bakal ikut tersendat. ` +
            `Contoh nyatanya kayak ban mobil bocor; mesinnya boleh bagus, tapi mobil tetep nggak bisa jalan mulus. Paham kan logikanya?`
          : `Alright, zooming in on point #${idx + 1}: **"${targetPoint}"**.\n\n` +
            `Here's why this matters so much: it functions as the critical bottleneck. If this part fails, everything downstream crashes. ` +
            `Think of it like a highway toll booth; even if the highway has 8 lanes, a slow booth backs up the entire city. Makes sense?`;
      }
    }

    // 7. Math & Logic
    const mathMatch = lower.match(/^(?:what is|calculate|hitung|berapa)?\s*([0-9\s+\-*/().^%]+)\s*\??$/);
    if (mathMatch && mathMatch[1].trim().length >= 3 && /[+\-*/]/.test(mathMatch[1])) {
      try {
        const cleanExpr = mathMatch[1].replace(/[^0-9+\-*/().]/g, '');
        const res = Function(`'use strict'; return (${cleanExpr})`)();
        if (typeof res === 'number' && !isNaN(res)) {
          return isIndo
            ? `Nih hasil hitungannya: **${cleanExpr} = ${res}**. Gampang kan? Jangan pusing-pusing pake kalkulator lagi!`
            : `Boom, math solved: **${cleanExpr} = ${res}**. That was quick, wasn't it?`;
        }
      } catch (e) {}
    }

    // 8. General Knowledge (Gravity, Coding, Science, History, Life)
    if (/gravitasi|gravity/i.test(lower)) {
      return isIndo
        ? `${getPersonalityHooks(true, 'intro')}\n\nGini lho cara mikir soal gravitasi: bayangin kasur empuk, terus lu taro bola bowling di tengahnya. Kasurnya bakal melengkung ke bawah kan? Nah, kalau lu gelindingin kelereng di deket bola bowling itu, kelerengnya bakal keputer ngedeket. Itu yang dibilang Einstein: gravitasi bukan tali gaib yang narik benda, tapi massa benda gede (kayak bumi) yang 'bikin lekukan' di ruang dan waktu. Keren kan?`
        : `${getPersonalityHooks(false, 'intro')}\n\nHere is how to intuitively visualize gravity: imagine a memory foam mattress, and drop a heavy bowling ball in the middle. The mattress sags, right? If you roll a marble nearby, it curves toward the bowling ball. That was Einstein's breakthrough: gravity isn't an invisible rope pulling stuff—it's heavy objects bending the literal fabric of space and time. Pretty wild, right?`;
    }

    if (/python|javascript|coding|pemrograman/i.test(lower)) {
      return isIndo
        ? `Mau ngoding? Kuncinya cuma satu: **jangan cuma baca teori, langsung buka text editor dan ketik!** Mau Python buat data/AI atau JavaScript buat web, prinsip dasarnya sama: algoritma itu cuma resep masak langkah demi langkah. Ada baris kode yang bikin lu bingung? Tunjukin ke gw, kita beresin bareng!`
        : `Diving into code? Golden rule: **stop just watching tutorials, start typing and breaking stuff!** Whether it's Python for AI/data or JavaScript for interactive apps, code is just a logical cooking recipe. Got a bug or a concept tripping you up? Paste it here, let's crush it.`;
    }

    if (/tips belajar|cara belajar|study tips|how to study|fokus/i.test(lower)) {
      return isIndo
        ? `${getPersonalityHooks(true, 'intro')}\n\nBuang metode baca berulang-ulang yang bikin ngantuk itu. Nih trik paling jitu:\n\n1. **Tes Diri Sendiri (Active Recall)**: Baca 1 halaman, tutup bukunya, terus paksa diri lu jelasin ulang pake bahasa lu sendiri. Kalau nggak bisa, berarti belum paham.\n2. **Feynman Technique**: Jelaskan seolah-olah lu lagi ngajarin bocil 10 tahun. Nggak boleh pake istilah ribet!\n3. **Fokus 25 Menit (Pomodoro)**: Jauhin HP. Fokus murni 25 menit, terus istirahat 5 menit. Selesai!`
        : `${getPersonalityHooks(false, 'intro')}\n\nStop passively re-reading highlighting notes like a zombie. Here's how high-performers actually study:\n\n1. **Active Recall**: Read a section, close the tab, and force your brain to explain it out loud. If you stumble, you don't know it yet.\n2. **The Feynman Trick**: Explain it in words so simple a 10-year-old would get it. Strip all fancy jargon.\n3. **25-min Sprints**: Phone in another room. 25 minutes of pure locked-in focus, then 5 minutes of chill.`;
    }

    return null; // Not pure small talk, let main engine handle
  }

  // Synthesizes document concepts in dynamic human words WITHOUT copy-pasting
  function distillDocumentConcept(prompt, bestChunk, doc, isIndo) {
    const raw = bestChunk.content;
    const lowerPrompt = prompt.toLowerCase();

    // Identify the specific topic asked about
    let matchedTopic = (doc.keyTopics || []).find((t) => lowerPrompt.includes(t.toLowerCase())) || 'topik ini';
    
    // Extract key sentences
    const sentences = raw.split(/(?<=[.?!])\s+/).filter((s) => s.length > 25 && s.length < 220);
    const coreFact = sentences[0] || 'Prinsip fundamental dari materi ini.';
    const subFact = sentences[1] || '';

    const intro = getPersonalityHooks(isIndo, 'intro');
    const outro = getPersonalityHooks(isIndo, 'outro');

    let humanSpeech = '';

    if (isIndo) {
      humanSpeech += `${intro}\n\n`;
      humanSpeech += `Kalau di buku materinya kedengeran rumit, intinya sebenarnya to the point begini: **${coreFact.replace(/^(BAB|CHAPTER|\d+[:.]?)\s*/i, '')}**.\n\n`;

      if (subFact) {
        humanSpeech += `Nah, mekanisme di baliknya tuh cara kerjanya gini: ${subFact} Jadi jangan dihafalin kata demi kata, tapi pahami alur sebab-akibatnya.\n\n`;
      }

      humanSpeech += `${outro}\n\n`;
      humanSpeech += `*(Catatan: Dirangkum dari **${doc.fileName}**, Halaman/Bagian ${bestChunk.pageNumber || 1})*`;
    } else {
      humanSpeech += `${intro}\n\n`;
      humanSpeech += `The textbook threw a wall of jargon at you, but here's the distilled core: **${coreFact.replace(/^(CHAPTER|SECTION|\d+[:.]?)\s*/i, '')}**.\n\n`;

      if (subFact) {
        humanSpeech += `The underlying gear turning behind the scenes is this: ${subFact} In other words, focus on the cause-and-effect chain rather than memorizing definitions.\n\n`;
      }

      humanSpeech += `${outro}\n\n`;
      humanSpeech += `*(Synthesized from **${doc.fileName}**, Page/Section ${bestChunk.pageNumber || 1})*`;
    }

    return humanSpeech;
  }

  function generateAnswer(prompt, intent, activeDocuments) {
    const clean = prompt.trim();
    const lower = clean.toLowerCase();
    const isIndo = isIndonesian(clean);

    // 1. Try human conversation / dialogue / general thinking
    const dialogueReply = handleHumanDialogue(prompt, lower, isIndo);
    if (dialogueReply) {
      recordMemory('user', prompt);
      recordMemory('assistant', dialogueReply);
      return { content: dialogueReply, citations: [] };
    }

    // 2. Greetings with Attitude
    if (intent.subType === 'GREETING') {
      let greetText = '';
      if (currentAttitude === 'sassy') {
        greetText = isIndo
          ? `Yo! 👋 Apa kabar? Gw siap bantu lu ngebantai materi belajar hari ini. Udah upload file atau mau ngobrol santai dulu? Mau langsung sikat kuis di tab Kuis juga boleh!`
          : `Hey there! 👋 Ready to conquer your notes or just procrastinating? I'm your offline study buddy with zero filter and maximum clarity. Throw a document at me or ask me anything!`;
      } else if (currentAttitude === 'chill') {
        greetText = isIndo
          ? `Halo! 👋 Santai aja belajarnya hari ini. Ada materi yang mau dibedah bareng atau ada pertanyaan umum? Silakan lempar kapan pun!`
          : `Hello! 👋 Hope you're having a smooth day. Take it easy and let me know what study topic or question you'd like to explore!`;
      } else {
        greetText = isIndo
          ? `Halo. Mari kita mulai. Siapkan fokus lu, unggah materi yang mau dipelajari, dan kita bahas langsung ke intinya.`
          : `Greetings. Let's get straight to work. Upload your material or ask your question to get the bottom line immediately.`;
      }

      recordMemory('user', prompt);
      recordMemory('assistant', greetText);
      return { content: greetText, citations: [] };
    }

    // 3. Document Summary with Attitude (No wall of text!)
    if (intent.type === 'DOCUMENT_SUMMARY' && activeDocuments.length > 0) {
      const doc = activeDocuments[0];
      const topics = (doc.keyTopics || []).slice(0, 5);
      const topChunk = doc.chunks?.[0];

      const citations = topChunk ? [{
        chunkId: topChunk.id,
        fileName: doc.fileName,
        pageNumber: topChunk.pageNumber,
        paragraph: topChunk.paragraph,
        snippet: topChunk.content.substring(0, 160) + '...',
        score: 1.0
      }] : [];

      let summaryText = '';
      if (isIndo) {
        summaryText = `### 📋 Inti Sari Dokumen: ${doc.fileName}\n\n` +
          `${getPersonalityHooks(true, 'intro')}\n\n` +
          `File ini ngebahas **${topics[0] || 'topik utama'}** tanpa perlu lu pusingin detail kecilnya dulu. Fokus utama ada di topik-topik krusial ini:\n` +
          topics.map((t) => `- **${t}**: Pilar utama yang wajib lu pahami logikanya.`).join('\n') +
          `\n\n💡 **Tips Belajar:** Nggak usah baca ulang semuanya dari awal. Langsung loncat ke tab **"Quiz Studio"** di atas buat nguji seberapa nempel materinya di kepala lu!`;
      } else {
        summaryText = `### 📋 The Real Summary: ${doc.fileName}\n\n` +
          `${getPersonalityHooks(false, 'intro')}\n\n` +
          `This document revolves around **${topics[0] || 'the core subject'}**. Here are the high-yield pillars you actually need to understand:\n` +
          topics.map((t) => `- **${t}**: A foundational concept that holds the rest together.`).join('\n') +
          `\n\n💡 **Action Step:** Don't waste time passively re-reading. Jump to the **"Quiz Studio"** tab at the top to test your recall right now!`;
      }

      recordMemory('user', prompt);
      recordMemory('assistant', summaryText);
      return { content: summaryText, citations };
    }

    // 4. Holistic Semantic Answering (Direct Answer to the Sentence as a Whole)
    if (window.SemanticMatcher) {
      const direct = window.SemanticMatcher.findDirectAnswer(prompt, activeDocuments);
      if (direct.found) {
        const intro = getPersonalityHooks(isIndo, 'intro');
        const outro = getPersonalityHooks(isIndo, 'outro');
        
        let fullSpeech = `${intro}\n\n${direct.answer}\n\n${outro}`;
        if (direct.citation) {
          const loc = direct.citation.pageNumber ? `Halaman/Bagian ${direct.citation.pageNumber}` : `Bagian ${direct.citation.paragraph || 1}`;
          fullSpeech += isIndo 
            ? `\n\n*(Berdasarkan **${direct.citation.fileName}**, ${loc})*`
            : `\n\n*(Based on **${direct.citation.fileName}**, ${loc})*`;
        }

        const citations = direct.citation ? [{
          chunkId: 'sem_match',
          fileName: direct.citation.fileName,
          pageNumber: direct.citation.pageNumber,
          paragraph: direct.citation.paragraph,
          snippet: direct.citation.snippet,
          score: 1.0
        }] : [];

        recordMemory('user', prompt);
        recordMemory('assistant', fullSpeech);
        return { content: fullSpeech, citations };
      }
    }

    // 5. Document Grounded Query (Targeted Distillation, ZERO Full Copy-Pasting!)
    if (intent.isDocumentRelated && activeDocuments.length > 0) {
      const searchResults = window.RetrievalEngine.searchChunks(prompt, activeDocuments, 3);
      if (searchResults.length > 0) {
        const best = searchResults[0];
        const doc = activeDocuments.find((d) => d.fileName === best.chunk.fileName) || activeDocuments[0];

        // Human conversational distillation
        const speech = distillDocumentConcept(prompt, best.chunk, doc, isIndo);

        const citations = [{
          chunkId: best.chunk.id,
          fileName: best.chunk.fileName,
          pageNumber: best.chunk.pageNumber,
          paragraph: best.chunk.paragraph,
          snippet: best.snippet,
          score: best.score
        }];

        recordMemory('user', prompt);
        recordMemory('assistant', speech);
        return { content: speech, citations };
      }
    }

    // 5. General Fallback Thinking (Spoken naturally)
    let fallback = '';
    if (isIndo) {
      fallback = `${getPersonalityHooks(true, 'intro')}\n\n` +
        `Soal **"${prompt}"**: secara konsep umum, ini berhubungan erat sama bagaimana proses dasarnya berjalan dan diterapkan di dunia nyata. ` +
        `Kalau ini ada di catatan kuliah atau modul lu, coba unggah filenya di sebelah kiri biar gw bedah poin spesifiknya bareng lu!`;
    } else {
      fallback = `${getPersonalityHooks(false, 'intro')}\n\n` +
        `Regarding **"${prompt}"**: looking at the big picture, this boils down to how the foundational rules govern the outcome. ` +
        `If this is from a specific class slide or PDF, toss it into the sidebar upload and I'll pinpoint the exact mechanics for you!`;
    }

    recordMemory('user', prompt);
    recordMemory('assistant', fallback);
    return { content: fallback, citations: [] };
  }

  window.StudyAssistant = {
    generateAnswer,
    setAttitude,
    getAttitude,
    clearMemory,
    getMemory: () => memory
  };
})();
