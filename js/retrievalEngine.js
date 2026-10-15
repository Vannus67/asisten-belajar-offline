// In-browser client-side BM25 Semantic Retrieval Engine
(function () {
  function searchChunks(query, activeDocuments, topK = 3) {
    if (!query || !activeDocuments || activeDocuments.length === 0) {
      return [];
    }

    const queryTokens = window.DocumentParser.tokenize(query);
    if (queryTokens.length === 0) return [];

    const allChunks = [];
    for (const doc of activeDocuments) {
      if (doc.chunks) {
        for (const ch of doc.chunks) {
          allChunks.push({
            ...ch,
            fileName: doc.fileName
          });
        }
      }
    }

    if (allChunks.length === 0) return [];

    const N = allChunks.length;
    const totalTokens = allChunks.reduce((sum, ch) => sum + (ch.tokens?.length || 0), 0);
    const avgLen = totalTokens / N || 1;

    // Calculate IDF
    const idf = {};
    for (const t of queryTokens) {
      let docCount = 0;
      for (const ch of allChunks) {
        if (ch.tokens && ch.tokens.includes(t)) {
          docCount++;
        }
      }
      idf[t] = Math.log(1 + (N - docCount + 0.5) / (docCount + 0.5));
    }

    const k1 = 1.5;
    const b = 0.75;
    const lowerQuery = query.toLowerCase();

    const scored = [];
    for (const ch of allChunks) {
      const docLen = ch.tokens ? ch.tokens.length : 1;
      const freq = {};
      if (ch.tokens) {
        for (const t of ch.tokens) {
          freq[t] = (freq[t] || 0) + 1;
        }
      }

      let score = 0;
      for (const t of queryTokens) {
        const tf = freq[t] || 0;
        if (tf > 0) {
          const idfVal = idf[t] || 0.1;
          const numerator = tf * (k1 + 1);
          const denominator = tf + k1 * (1 - b + b * (docLen / avgLen));
          score += idfVal * (numerator / denominator);
        }
      }

      // Exact phrase bonus
      if (lowerQuery.length > 5 && ch.content.toLowerCase().includes(lowerQuery)) {
        score += 3.0;
      }

      if (score > 0) {
        const snippet = extractSnippet(ch.content, queryTokens);
        scored.push({
          chunk: ch,
          score: Math.round(score * 10) / 10,
          snippet
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  function extractSnippet(content, queryTokens, maxLength = 220) {
    const sentences = content.split(/(?<=[.?!])\s+/);
    let bestIdx = 0;
    let maxMatch = -1;

    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i].toLowerCase();
      let matches = 0;
      for (const t of queryTokens) {
        if (s.includes(t)) matches++;
      }
      if (matches > maxMatch) {
        maxMatch = matches;
        bestIdx = i;
      }
    }

    const start = Math.max(0, bestIdx - 1);
    const end = Math.min(sentences.length, bestIdx + 2);
    let snippet = sentences.slice(start, end).join(' ');

    if (snippet.length > maxLength) {
      snippet = snippet.substring(0, maxLength) + '...';
    }
    return snippet.trim();
  }

  window.RetrievalEngine = {
    searchChunks
  };
})();
