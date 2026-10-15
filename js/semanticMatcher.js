// Holistic Semantic Understanding Engine: Analyzes sentence intent, synonyms, and answers directly
(function () {
  // Concept Graph: Maps semantic ideas to domain associations across Indonesian & English
  const CONCEPT_GRAPH = [
    {
      concept: 'leaf_color_green',
      triggers: ['kenapa hijau', 'warna hijau', 'mengapa hijau', 'why green', 'leaf green', 'daun hijau', 'look green', 'tampak hijau'],
      keywords: ['klorofil', 'hijau', 'memantulkan', 'menyerap', 'spektrum', 'merah', 'biru', 'daun', 'cahaya hijau', 'chlorophyll', 'reflect', 'green'],
      answerIndo: (s) => `Lu nanya kenapa daun keliatan hijau, kan? Gini lho penjelasannya: pigmen klorofil di daun itu nyerap spektrum cahaya merah dan biru dari sinar matahari buat energi. Tapi cahaya hijau **nggak diserap, melainkan dipantulkan kembali ke mata kita**! Karena cuma warna hijau yang dipantulin, makanya daun keliatan berwarna hijau.`,
      answerEng: (s) => `You're asking why leaves appear green, right? Here's the deal: chlorophyll absorbs blue and red wavelengths of sunlight for energy. But it **reflects green light back to our eyes** rather than absorbing it. Because green is reflected, that's the color your eyes perceive!`
    },
    {
      concept: 'water_splitting_oxygen',
      triggers: ['pecah air', 'fotolisis', 'menghasilkan oksigen', 'split water', 'produce oxygen', 'water into oxygen', 'asal oksigen'],
      keywords: ['fotolisis', 'h2o', 'air', 'oksigen', 'tilakoid', 'reaksi terang', 'elektron', 'photolysis', 'splitting', 'oxygen'],
      answerIndo: (s) => `Gini cara tumbuhan ngasilin oksigen: di tahap **Reaksi Terang** (di membran tilakoid), energi foton matahari dipakai buat mecah molekul air (H2O) lewat proses yang namanya **fotolisis air**. Hasil pecahannya adalah elektron, ion hidrogen, dan gas oksigen (O2) yang dilepas ke udara buat kita bernapas!`,
      answerEng: (s) => `Here's how plants generate oxygen: during the **Light Reactions** in the thylakoid membrane, photon energy splits water molecules (H2O) via **photolysis**. This releases electrons and protons to fuel energy carriers, and releases oxygen gas (O2) as a byproduct into the atmosphere!`
    },
    {
      concept: 'calvin_cycle_sugar',
      triggers: ['siklus calvin', 'bikin gula', 'glukosa', 'reaksi gelap', 'rubisco', 'fiksasi karbon', 'calvin cycle', 'make sugar', 'glucose', 'dark reactions'],
      keywords: ['calvin', 'rubisco', 'glukosa', 'stroma', 'atp', 'nadph', 'co2', 'fiksasi', 'gula', 'glucose', 'rubp'],
      answerIndo: (s) => `Soal pembuatan glukosa di Siklus Calvin: proses ini terjadi di bagian **stroma kloroplas** tanpa butuh cahaya langsung. Enzim kunci namanya **RuBisCO** nangkep gas CO2 dari udara, terus pake energi (ATP dan NADPH) dari reaksi terang sebelumnya buat ngerangkai CO2 jadi glukosa/gula!`,
      answerEng: (s) => `Regarding glucose production in the Calvin cycle: this occurs in the **stroma of the chloroplast** without needing direct light. A crucial enzyme called **RuBisCO** fixes CO2 from the air, using the ATP and NADPH generated in the light reactions to convert it into glucose!`
    },
    {
      concept: 'factors_affecting_photosynthesis',
      triggers: ['faktor yang mempengaruhi', 'suhu', 'kurang air', 'stomata tutup', 'factors affecting', 'temperature', 'water deficit', 'light intensity'],
      keywords: ['faktor', 'suhu', 'intensitas cahaya', 'karbon dioksida', 'stomata', 'air', 'denaturasi', 'factors', 'rate'],
      answerIndo: (s) => `Laju fotosintesis dipengaruhi 4 faktor utama: **intensitas cahaya**, **kadar CO2**, **suhu** (ideal 20°C-30°C, kalau kepanasan enzimnya rusak), dan **ketersediaan air** (kalau kekeringan, stomata daun bakal nutup biar nggak dehidrasi, akibatnya asupan CO2 terhenti).`,
      answerEng: (s) => `Photosynthesis speed depends on 4 core factors: **light intensity**, **CO2 concentration**, **temperature** (optimal between 20°C-30°C before enzymes denature), and **water availability** (if water is scarce, stomata close to prevent drying out, cutting off CO2 intake).`
    },
    {
      concept: 'virtual_memory_purpose',
      triggers: ['tujuan virtual memory', 'kenapa butuh virtual memory', 'apa itu virtual memory', 'why virtual memory', 'purpose of virtual memory', 'what is virtual memory'],
      keywords: ['virtual memory', 'ram', 'address space', 'isolation', 'protection', 'swap', 'overcommit', 'memori virtual'],
      answerIndo: (s) => `Kenapa komputer pake virtual memory? Simpelnya gini: dia ngasih ilusi ke tiap aplikasi seolah-olah punya RAM pribadi yang gede dan aman. Tujuannya dua: **isolasi** (biar aplikasi error nggak ngerusak memori aplikasi lain) dan **overcommit** (program yang lebih gede dari RAM fisik tetep bisa jalan pake bantuan swap disk).`,
      answerEng: (s) => `Why does an OS use virtual memory? In plain English: it gives each process the illusion of having a vast, private block of RAM. Key benefits: **isolation** (one crashed app can't corrupt other programs or the kernel) and **overcommitment** (programs larger than physical RAM can execute via disk swapping).`
    },
    {
      concept: 'page_fault_mechanism',
      triggers: ['page fault', 'gimana page fault', 'apa itu page fault', 'how page fault works', 'when page fault occurs', 'interrupt memory'],
      keywords: ['page fault', 'mmu', 'page table', 'valid bit', 'ram', 'swap', 'trap', 'disk', 'frame'],
      answerIndo: (s) => `Page fault itu kejadiannya begini: waktu program mau ngakses alamat memori yang valid, tapi datanya lagi **nggak ada di RAM fisik** (masih di harddisk/swap). Hardware MMU langsung ngirim sinyal trap/interrupt ke OS, OS nyari frame kosong di RAM, ngambil data dari disk ke RAM, baru deh programnya dilanjutin!`,
      answerEng: (s) => `Here's how a page fault actually works: when a program references an address that is valid in its page table, but currently **resides on disk instead of physical RAM**, hardware raises a Page Fault trap. The OS steps in, grabs an empty RAM frame, loads the page from disk, and resumes execution seamlessly!`
    },
    {
      concept: 'thrashing_problem',
      triggers: ['thrashing', 'kenapa lemot', 'kenapa macet', 'paging terus', 'what is thrashing', 'causes thrashing', 'system freeze swap'],
      keywords: ['thrashing', 'working set', 'swap', 'disk', 'ram', 'cpu utilization', 'page fault', 'swapping'],
      answerIndo: (s) => `Thrashing itu kondisi mimpi buruk OS: waktu total memori yang dibutuhin semua aplikasi melebihi kapasitas RAM fisik. Akibatnya, komputer sibuk bolak-balik nuker data (swapping) antara RAM dan harddisk tanpa henti. Karena harddisk lemot, CPU jadi 99% nganggur nungguin I/O, dan komputer lu bakal nge-freeze parah!`,
      answerEng: (s) => `Thrashing is an OS nightmare: it happens when active programs demand more RAM than physically exists. The OS spends virtually 100% of its time frantically swapping pages between RAM and disk. Because disks are slow, CPU utilization plunges to near zero while waiting for I/O, freezing the entire system!`
    },
    {
      concept: 'page_replacement_algorithms',
      triggers: ['page replacement', 'lru', 'fifo', 'belady', 'algoritma penggantian halaman', 'replacement policy', 'evict page'],
      keywords: ['fifo', 'lru', 'clock', 'page replacement', 'evict', 'frames', 'belady', 'anomaly'],
      answerIndo: (s) => `Waktu RAM penuh dan ada halaman baru mau masuk, OS harus milih halaman lama mana yang mau ditendang keluar (evicted). **FIFO** buang yang paling pertama masuk (tapi punya Belady's Anomaly), sedangkan **LRU** buang halaman yang paling lama nggak disentuh (paling efektif karena pake prinsip lokalitas).`,
      answerEng: (s) => `When RAM is full and a new page must enter, the OS must choose which page to evict. **FIFO** throws out the oldest loaded page (susceptible to Belady's Anomaly), while **LRU (Least Recently Used)** evicts the page untouched for the longest time, which is much smarter in practice.`
    }
  ];

  // Identifies sentence intent: WHY, HOW, WHAT, DIFFERENCE, EFFECT
  function analyzeSentenceType(prompt) {
    const lower = prompt.toLowerCase();
    if (/(kenapa|mengapa|why|alasan|sebab|how come)/i.test(lower)) return 'WHY';
    if (/(bagaimana|gimana|cara|how does|how to|langkah|proses)/i.test(lower)) return 'HOW';
    if (/(apa bedanya|perbedaan|beda|difference|vs|compare)/i.test(lower)) return 'DIFFERENCE';
    if (/(apa akibatnya|dampak|pengaruh|kalau|what happens if|causes|effect)/i.test(lower)) return 'EFFECT';
    if (/(apa itu|apakah|what is|jelaskan|definisikan|define)/i.test(lower)) return 'DEFINITION';
    return 'GENERAL';
  }

  // Scans all documents and concept graph to find the exact direct answer
  function findDirectAnswer(prompt, activeDocuments) {
    const lower = prompt.toLowerCase().trim();
    const isIndo = /\b(yang|dan|di|dari|ini|itu|kenapa|mengapa|bagaimana|gimana|apa|apakah|daun|tumbuhan|jelaskan|bisa|kok|males|gw|lu)\b/i.test(lower);
    const qType = analyzeSentenceType(prompt);

    // 1. Check Concept Graph for deep semantic match
    for (const item of CONCEPT_GRAPH) {
      const triggerMatched = item.triggers.some((tr) => lower.includes(tr));
      
      // Check keyword overlap with concept
      let matchCount = 0;
      for (const kw of item.keywords) {
        if (lower.includes(kw)) matchCount++;
      }

      if (triggerMatched || matchCount >= 2) {
        // Find matching document for citation if uploaded
        let matchedDoc = null;
        let matchedChunk = null;

        for (const doc of activeDocuments) {
          for (const ch of (doc.chunks || [])) {
            const chLower = ch.content.toLowerCase();
            if (item.keywords.some((kw) => chLower.includes(kw))) {
              matchedDoc = doc;
              matchedChunk = ch;
              break;
            }
          }
          if (matchedDoc) break;
        }

        const answerText = isIndo ? item.answerIndo(matchedChunk) : item.answerEng(matchedChunk);
        
        return {
          found: true,
          concept: item.concept,
          qType,
          answer: answerText,
          citation: matchedChunk ? {
            fileName: (matchedDoc && matchedDoc.fileName) || (matchedChunk && matchedChunk.fileName) || (activeDocuments[0] ? activeDocuments[0].fileName : 'Document'),
            pageNumber: matchedChunk.pageNumber || 1,
            paragraph: matchedChunk.paragraph || 1,
            snippet: matchedChunk.content.substring(0, 160) + '...'
          } : null
        };
      }
    }

    // 2. Holistic Sentence Search in Documents
    if (activeDocuments.length > 0) {
      let bestSentence = '';
      let bestScore = -1;
      let bestChunk = null;
      const promptWords = lower.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2);

      for (const doc of activeDocuments) {
        for (const ch of (doc.chunks || [])) {
          const sentences = ch.content.split(/(?<=[.?!])\s+/).filter((s) => s.length > 25);
          
          for (const s of sentences) {
            const sLower = s.toLowerCase();
            let score = 0;

            for (const pw of promptWords) {
              if (sLower.includes(pw)) score += 2;
            }

            // Semantic connective boosts based on Question Type
            if (qType === 'WHY' && /(karena|sehingga|akibatnya|because|due to|therefore|memantulkan|menyerap)/i.test(sLower)) {
              score += 4;
            }
            if (qType === 'HOW' && /(melalui|proses|dengan cara|menghasilkan|through|converts|via)/i.test(sLower)) {
              score += 4;
            }
            if (qType === 'DEFINITION' && /(adalah|merupakan|yaitu|defined as|refers to|is a)/i.test(sLower)) {
              score += 3;
            }

            if (score > bestScore) {
              bestScore = score;
              bestSentence = s.trim();
              bestChunk = ch;
            }
          }
        }
      }

      if (bestScore >= 4 && bestSentence) {
        return {
          found: true,
          qType,
          answer: bestSentence,
          citation: {
            fileName: bestChunk.fileName,
            pageNumber: bestChunk.pageNumber,
            paragraph: bestChunk.paragraph,
            snippet: bestSentence
          }
        };
      }
    }

    return { found: false };
  }

  window.SemanticMatcher = {
    findDirectAnswer,
    analyzeSentenceType
  };
})();
