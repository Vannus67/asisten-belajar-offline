// Document parser, text extractor, tokenization, and chunking engine
(function () {
  const STOPWORDS = new Set([
    // English Stopwords
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
    'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
    'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'can', 'just', 'should', 'now', 'into', 'over', 'after',
    // Indonesian Stopwords
    'yang', 'di', 'dan', 'dari', 'itu', 'dengan', 'untuk', 'ini', 'adalah', 'ke',
    'pada', 'juga', 'akan', 'atau', 'karena', 'bisa', 'ada', 'mereka', 'oleh',
    'dalam', 'saat', 'lebih', 'sudah', 'tersebut', 'bukan', 'hanya', 'ia', 'kita',
    'kamu', 'saya', 'dia', 'tentang', 'seperti', 'setelah', 'namun', 'dapat',
    'bahwa', 'secara', 'bagi', 'antara', 'oleh', 'hingga', 'lalu', 'yaitu'
  ]);

  function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  }

  function extractKeyTopics(text, maxTopics = 10) {
    const words = tokenize(text);
    const freq = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    // Capitalized terms or phrases from original text often represent key terms
    const headingMatches = text.match(/(?:BAB\s+\d+|CHAPTER\s+\d+|[A-Z][A-Za-z0-9\s-]{3,30}:)/g) || [];
    const keyTerms = new Set();

    headingMatches.forEach((h) => {
      const clean = h.replace(/^(BAB\s+\d+:?|CHAPTER\s+\d+:?)\s*/i, '').replace(/[:]/g, '').trim();
      if (clean.length > 3 && clean.length < 35) {
        keyTerms.add(clean);
      }
    });

    const sortedWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    for (const w of sortedWords) {
      if (keyTerms.size >= maxTopics) break;
      keyTerms.add(w);
    }

    return Array.from(keyTerms).slice(0, maxTopics);
  }

  function chunkText(text, targetWordCount = 200, overlap = 40) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const chunks = [];
    let chunkId = 0;

    let currentWords = [];
    let currentParagraphIndex = 1;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const p = paragraphs[pIdx].trim();
      const pWords = p.split(/\s+/).filter(Boolean);

      if (currentWords.length + pWords.length <= targetWordCount + overlap) {
        currentWords.push(...pWords);
      } else {
        if (currentWords.length > 0) {
          const chunkStr = currentWords.join(' ');
          chunks.push({
            id: `chunk_${chunkId++}`,
            paragraph: currentParagraphIndex,
            pageNumber: currentParagraphIndex,
            content: chunkStr,
            tokens: tokenize(chunkStr),
          });
          // Retain overlap
          currentWords = currentWords.slice(Math.max(0, currentWords.length - overlap));
        }
        currentWords.push(...pWords);
        currentParagraphIndex = pIdx + 1;
      }
    }

    if (currentWords.length > 0) {
      const chunkStr = currentWords.join(' ');
      chunks.push({
        id: `chunk_${chunkId++}`,
        paragraph: currentParagraphIndex,
        pageNumber: currentParagraphIndex,
        content: chunkStr,
        tokens: tokenize(chunkStr),
      });
    }

    return chunks;
  }

  async function parseFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      return await parsePdf(file);
    } else if (ext === 'docx') {
      return await parseDocx(file);
    } else if (ext === 'csv' || ext === 'tsv') {
      return await parseTabularFile(file, ext);
    } else if (ext === 'json') {
      return await parseJsonFile(file);
    } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'html', 'css', 'sql', 'sh', 'php', 'rb'].includes(ext)) {
      return await parseCodeFile(file, ext);
    } else {
      // Plain text, Markdown, RTF, XML, etc.
      return await parsePlainText(file);
    }
  }

  async function parseTabularFile(file, ext) {
    const raw = await file.text();
    const delimiter = ext === 'tsv' ? '\t' : ',';
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return parsePlainText(file);
    }

    const headers = lines[0].split(delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim());
    const rowCount = lines.length - 1;

    let formattedText = `TABULAR DATASET: ${file.name}\n` +
      `Total Columns: ${headers.length} (${headers.join(', ')})\n` +
      `Total Records: ${rowCount} rows\n\n` +
      `SAMPLE RECORDS & STRUCTURE:\n`;

    // Format first 50 rows into readable sentences/key-values
    const maxSample = Math.min(lines.length, 50);
    for (let i = 1; i < maxSample; i++) {
      const cols = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
      const rowDesc = headers.map((h, idx) => `${h}: ${cols[idx] || 'N/A'}`).join(' | ');
      formattedText += `Record ${i}: ${rowDesc}\n`;
    }

    if (lines.length > 50) {
      formattedText += `\n[... and ${lines.length - 50} more records in dataset]`;
    }

    const chunks = chunkText(formattedText);
    const keyTopics = [
      ...headers.slice(0, 6).map((h) => h.charAt(0).toUpperCase() + h.slice(1)),
      `${rowCount} Rows`,
      'Tabular Dataset'
    ];

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: ext.toUpperCase() + ' Spreadsheet',
      fullText: formattedText,
      wordCount: formattedText.split(/\s+/).filter(Boolean).length,
      chunks,
      keyTopics,
    };
  }

  async function parseJsonFile(file) {
    const raw = await file.text();
    let cleanText = '';
    let topics = [];

    try {
      const obj = JSON.parse(raw);
      if (Array.isArray(obj)) {
        cleanText = `JSON ARRAY DATASET (${obj.length} items):\n` +
          JSON.stringify(obj.slice(0, 30), null, 2);
        if (obj[0] && typeof obj[0] === 'object') {
          topics = Object.keys(obj[0]).slice(0, 6);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        cleanText = `JSON OBJECT DATA:\n` + JSON.stringify(obj, null, 2);
        topics = Object.keys(obj).slice(0, 6);
      } else {
        cleanText = raw;
      }
    } catch (e) {
      cleanText = raw;
    }

    const chunks = chunkText(cleanText);
    const keyTopics = topics.length > 0 ? topics : extractKeyTopics(cleanText);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'JSON Structured Data',
      fullText: cleanText,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      chunks,
      keyTopics,
    };
  }

  async function parseCodeFile(file, ext) {
    const raw = await file.text();
    const cleanText = raw.replace(/\r\n/g, '\n');

    // Extract function names, class names, or declarations
    const declMatches = cleanText.match(/(?:function\s+([A-Za-z0-9_]+)|class\s+([A-Za-z0-9_]+)|def\s+([A-Za-z0-9_]+)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:function|\()|void\s+([A-Za-z0-9_]+))/g) || [];
    const codeTopics = declMatches.map((m) => m.replace(/^(function|class|def|const|void)\s*/, '').replace(/[\s=].*$/, '').trim()).filter(Boolean);

    const chunks = chunkText(cleanText);
    const keyTopics = codeTopics.length > 0 ? codeTopics.slice(0, 8) : extractKeyTopics(cleanText);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: `${ext.toUpperCase()} Source Code`,
      fullText: cleanText,
      wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      chunks,
      keyTopics,
    };
  }

  async function parsePlainText(file) {
    const text = await file.text();
    // Clean RTF if uploaded
    let cleanText = text;
    if (file.name.toLowerCase().endsWith('.rtf')) {
      cleanText = text.replace(/\\par[d]?/g, '\n').replace(/\\\{.*?\}|\\[a-z0-9]+[\s]?/gi, ' ').replace(/\s+/g, ' ');
    }
    cleanText = cleanText.replace(/\r\n/g, '\n').trim();
    const words = cleanText.split(/\s+/).filter(Boolean);
    const chunks = chunkText(cleanText);
    const keyTopics = extractKeyTopics(cleanText);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: `${file.name.split('.').pop().toUpperCase()} Document`,
      fullText: cleanText,
      wordCount: words.length,
      chunks,
      keyTopics,
    };
  }

  async function parseDocx(file) {
    const arrayBuffer = await file.arrayBuffer();

    // Use mammoth if available
    if (window.mammoth) {
      try {
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const cleanText = result.value.replace(/\r\n/g, '\n').trim();
        const words = cleanText.split(/\s+/).filter(Boolean);
        const chunks = chunkText(cleanText);
        const keyTopics = extractKeyTopics(cleanText);

        return {
          fileName: file.name,
          fileSize: file.size,
          fileType: 'Word Document (DOCX)',
          fullText: cleanText,
          wordCount: words.length,
          chunks,
          keyTopics,
        };
      } catch (e) {
        console.warn('Mammoth failed, falling back:', e);
      }
    }

    // Fallback: simple text decode
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    let extracted = '';
    if (matches) {
      extracted = matches.map((m) => m.replace(/<[^>]+>/g, '')).join(' ');
    } else {
      extracted = text.replace(/[^\x20-\x7E\n]/g, ' ');
    }
    extracted = extracted.replace(/\s+/g, ' ').trim();

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'Word Document (DOCX)',
      fullText: extracted,
      wordCount: extracted.split(/\s+/).filter(Boolean).length,
      chunks: chunkText(extracted),
      keyTopics: extractKeyTopics(extracted),
    };
  }

  function chunkPages(pages, targetWordCount = 200, overlap = 40) {
    const chunks = [];
    let chunkId = 0;

    for (const page of pages) {
      const words = page.text.split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;

      let start = 0;
      while (start < words.length) {
        const end = Math.min(start + targetWordCount, words.length);
        const chunkWords = words.slice(start, end);
        const chunkStr = chunkWords.join(' ').trim();

        if (chunkStr.length > 0) {
          chunks.push({
            id: `chunk_${chunkId++}`,
            pageNumber: page.pageNumber,
            paragraph: page.pageNumber,
            content: chunkStr,
            tokens: tokenize(chunkStr),
          });
        }

        if (end >= words.length) break;
        start += Math.max(1, targetWordCount - overlap);
      }
    }

    if (chunks.length === 0 && pages.length > 0) {
      const fullText = pages.map((p) => p.text).join('\n\n');
      return chunkText(fullText, targetWordCount, overlap);
    }

    return chunks;
  }

  async function parsePdf(file) {
    const arrayBuffer = await file.arrayBuffer();

    // 1. Try PDF.js if available
    const pdfjs = window.pdfjsLib || (typeof window !== 'undefined' ? window['pdfjs-dist/build/pdf'] : null);
    if (pdfjs) {
      try {
        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = (typeof window !== 'undefined' && window.location) 
            ? 'lib/pdf.worker.min.js' 
            : './pdf.worker.js';
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
          isEvalSupported: false,
        });

        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;
        const pages = [];
        let fullText = '';

        for (let i = 1; i <= pageCount; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items
            .map((item) => (item && item.str ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (pageStr) {
            pages.push({ pageNumber: i, text: pageStr });
            fullText += `\n[Page ${i}]\n` + pageStr;
          }
        }

        const cleanText = fullText.trim();
        const chunks = chunkPages(pages);
        const keyTopics = extractKeyTopics(cleanText);

        return {
          fileName: file.name,
          fileSize: file.size,
          fileType: 'PDF Document',
          fullText: cleanText,
          pageCount,
          wordCount: cleanText.split(/\s+/).filter(Boolean).length,
          chunks,
          keyTopics,
        };
      } catch (err) {
        console.warn('PDF.js loading failed, attempting pure offline byte extraction:', err);
      }
    }

    // 2. Pure offline fallback: parse string objects from PDF stream
    const uint8 = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('latin1');
    const rawPdf = textDecoder.decode(uint8);

    // Extract text in parentheses (Tj / TJ operators in PDF)
    const textMatches = [];
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = tjRegex.exec(rawPdf)) !== null) {
      const decoded = match[1].replace(/\\([()\\])/g, '$1');
      if (decoded.length > 1) {
        textMatches.push(decoded);
      }
    }

    const fallbackText = textMatches.join(' ').replace(/\s+/g, ' ').trim() ||
      'Extracted raw PDF contents. Study material loaded.';

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: 'PDF Document',
      fullText: fallbackText,
      pageCount: 1,
      wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
      chunks: chunkText(fallbackText),
      keyTopics: extractKeyTopics(fallbackText),
    };
  }

  window.DocumentParser = {
    tokenize,
    extractKeyTopics,
    chunkText,
    chunkPages,
    parseFile,
  };
})();
