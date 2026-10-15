// Interactive Quiz Engine: Generates and manages quizzes from any uploaded document
(function () {
  let currentQuiz = null;

  function generateQuiz(documents, options = {}) {
    const {
      questionCount = 5,
      type = 'multiple_choice', // 'multiple_choice' | 'true_false' | 'mixed'
      difficulty = 'medium',
      customTopic = ''
    } = options;

    if (!documents || documents.length === 0) {
      return {
        error: 'No study material uploaded. Please upload a document to generate a quiz.'
      };
    }

    const doc = documents[0];
    const chunks = doc.chunks || [];
    if (chunks.length === 0) {
      return {
        error: 'The uploaded file does not contain enough text to generate questions.'
      };
    }

    // Filter chunks by custom topic if specified
    let targetChunks = chunks;
    if (customTopic.trim()) {
      const topicLower = customTopic.toLowerCase();
      const matched = chunks.filter((c) => c.content.toLowerCase().includes(topicLower));
      if (matched.length > 0) {
        targetChunks = matched;
      }
    }

    const questions = [];
    const usedSentences = new Set();

    for (let i = 0; i < targetChunks.length && questions.length < questionCount; i++) {
      const chunk = targetChunks[i % targetChunks.length];
      const sentences = chunk.content
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 35 && s.length < 220);

      for (const sent of sentences) {
        if (questions.length >= questionCount) break;
        if (usedSentences.has(sent)) continue;
        usedSentences.add(sent);

        // Determine question style
        const qType = type === 'mixed' 
          ? (questions.length % 2 === 0 ? 'multiple_choice' : 'true_false')
          : type;

        if (qType === 'true_false') {
          const isTrue = Math.random() > 0.4;
          let questionText = '';
          let explanation = '';

          if (isTrue) {
            questionText = `True or False: According to ${doc.fileName}, "${sent}"`;
            explanation = `Correct! The document states: "${sent}"`;
          } else {
            // Modify a key word to create a false statement
            const words = sent.split(' ');
            const modified = words.map((w, idx) => {
              if (idx === Math.floor(words.length / 2)) return 'NOT';
              return w;
            }).join(' ');
            questionText = `True or False: According to ${doc.fileName}, "${modified}"`;
            explanation = `False! The actual statement from the text is: "${sent}"`;
          }

          questions.push({
            id: `q_${questions.length + 1}`,
            type: 'true_false',
            question: questionText,
            options: ['True', 'False'],
            correctAnswer: isTrue ? 'True' : 'False',
            explanation,
            sourceFile: doc.fileName,
            pageNumber: chunk.pageNumber,
            userAnswer: null
          });
        } else {
          // Multiple Choice Question
          const qData = buildMultipleChoiceQuestion(sent, chunk, doc, questions.length + 1);
          if (qData) {
            questions.push(qData);
          }
        }
      }
    }

    // Fallback if not enough questions generated
    if (questions.length === 0) {
      questions.push({
        id: 'q_1',
        type: 'multiple_choice',
        question: `What is the primary subject matter discussed in ${doc.fileName}?`,
        options: [
          doc.keyTopics?.[0] || 'Core Subject Matter',
          'Unrelated fictional story',
          'Historical ancient poetry',
          'Irrelevant random notes'
        ],
        correctAnswer: doc.keyTopics?.[0] || 'Core Subject Matter',
        explanation: `The material primarily explores ${doc.keyTopics?.slice(0, 3).join(', ') || 'the uploaded concepts'}.`,
        sourceFile: doc.fileName,
        pageNumber: 1,
        userAnswer: null
      });
    }

    currentQuiz = {
      id: `quiz_${Date.now()}`,
      documentName: doc.fileName,
      totalQuestions: questions.length,
      questions,
      currentIndex: 0,
      score: 0,
      isCompleted: false,
      createdAt: Date.now()
    };

    return currentQuiz;
  }

  function buildMultipleChoiceQuestion(sentence, chunk, doc, qNumber) {
    // Look for key concepts or terms in sentence
    const words = sentence.split(/\s+/).filter((w) => w.length > 4);
    const keyTerm = words.find((w) => /^[A-Z]/.test(w)) || words[Math.floor(words.length / 3)] || 'concept';
    const cleanTerm = keyTerm.replace(/[^A-Za-z0-9]/g, '');

    const questionText = `Based on ${doc.fileName} (Page/Section ${chunk.pageNumber || 1}): In the context of "${cleanTerm}", which statement is accurate?`;
    const correctAnswer = sentence;

    // Distractors
    const otherChunks = (doc.chunks || []).filter((c) => c.id !== chunk.id);
    const distractors = [];

    for (const oc of otherChunks) {
      if (distractors.length >= 3) break;
      const s = oc.content.split(/(?<=[.?!])\s+/).find((item) => item.length > 25 && item !== sentence);
      if (s && !distractors.includes(s)) {
        distractors.push(s);
      }
    }

    while (distractors.length < 3) {
      distractors.push(`This mechanism is unrelated to ${cleanTerm} and does not occur in ${doc.fileName}.`);
      distractors.push(`The process is reversed under standard room temperature conditions.`);
      distractors.push(`None of the described factors influence the outcome of ${cleanTerm}.`);
    }

    // Shuffle options
    const allOptions = [correctAnswer, ...distractors.slice(0, 3)];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    return {
      id: `q_${qNumber}`,
      type: 'multiple_choice',
      question: questionText,
      options: allOptions,
      correctAnswer,
      explanation: `Verified from ${doc.fileName} [Page/Section ${chunk.pageNumber || 1}]: "${sentence}"`,
      sourceFile: doc.fileName,
      pageNumber: chunk.pageNumber,
      userAnswer: null
    };
  }

  function getCurrentQuiz() {
    return currentQuiz;
  }

  function submitAnswer(questionId, selectedOption) {
    if (!currentQuiz) return null;
    const q = currentQuiz.questions.find((item) => item.id === questionId);
    if (!q) return null;

    q.userAnswer = selectedOption;
    q.isCorrect = selectedOption === q.correctAnswer;

    // Check if all answered
    const answeredCount = currentQuiz.questions.filter((item) => item.userAnswer !== null).length;
    if (answeredCount === currentQuiz.questions.length) {
      currentQuiz.isCompleted = true;
      currentQuiz.score = currentQuiz.questions.filter((item) => item.isCorrect).length;
    }

    return {
      isCorrect: q.isCorrect,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      isCompleted: currentQuiz.isCompleted,
      score: currentQuiz.score,
      total: currentQuiz.questions.length
    };
  }

  window.QuizEngine = {
    generateQuiz,
    getCurrentQuiz,
    submitAnswer
  };
})();
