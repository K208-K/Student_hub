const Doubt = require('../models/Doubt');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a highly knowledgeable academic tutor helping college students.
Your role:
- Give clear, accurate, structured explanations.
- Use headings (##), bullet points, bold text, and examples.
- Include formulas in plain text (e.g., F = ma).
- When applicable, provide step-by-step solutions.
- End with a practice question or tip.
- Keep answers concise but thorough (200-400 words).
- If the question is vague, ask for clarification.
- Cover subjects: Math, Physics, Chemistry, CS, Engineering, English, etc.`;

// Call Gemini API from backend (never expose key to frontend)
async function callGemini(question) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback: return a helpful structured response if no API key
    return generateFallbackResponse(question);
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nStudent's question: ${question}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API error:', response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  return text;
}

// Detect subject from question
function detectSubject(question) {
  const q = question.toLowerCase();
  if (q.match(/math|calculus|algebra|equation|derivative|integral|matrix|probability|statistics/)) return 'Mathematics';
  if (q.match(/physics|newton|force|motion|gravity|quantum|thermodynamic|optics|wave/)) return 'Physics';
  if (q.match(/chemistry|organic|inorganic|reaction|molecule|atom|bond|acid|base/)) return 'Chemistry';
  if (q.match(/code|program|algorithm|data structure|array|sort|python|java|c\+\+|javascript|sql|database|oop|api/)) return 'Computer Science';
  if (q.match(/network|tcp|udp|osi|ip address|router|protocol|http/)) return 'Networking';
  if (q.match(/circuit|transistor|resistor|capacitor|diode|amplifier|signal/)) return 'Electronics';
  if (q.match(/english|grammar|essay|literature|poem|writing|vocabulary/)) return 'English';
  if (q.match(/economics|supply|demand|gdp|inflation|market|business/)) return 'Economics';
  return 'General';
}

// Fallback response generator (when no API key provided)
function generateFallbackResponse(question) {
  const q = question.toLowerCase();

  if (q.match(/newton|force|motion/)) {
    return `## Newton's Laws of Motion\n\n**First Law (Inertia):** An object remains at rest or in uniform motion unless acted upon by an external force.\n\n**Second Law:** F = ma (Force equals mass times acceleration)\n\n**Third Law:** Every action has an equal and opposite reaction.\n\n### Example\nA 10 kg box pushed with 50 N:\n- Acceleration = F/m = 50/10 = **5 m/s²**\n\n💡 *Practice: What force is needed to accelerate a 5 kg object at 3 m/s²?*`;
  }

  if (q.match(/derivative|differentiation|calculus/)) {
    return `## Differentiation\n\n### Key Rules:\n1. **Power Rule:** d/dx(xⁿ) = nxⁿ⁻¹\n2. **Product Rule:** d/dx(uv) = u'v + uv'\n3. **Chain Rule:** d/dx(f(g(x))) = f'(g(x)) · g'(x)\n\n### Example\nf(x) = 3x² + 2x + 1\nf'(x) = 6x + 2\n\n💡 *Practice: Find d/dx of x³ + 5x² - 3x + 7*`;
  }

  if (q.match(/array|linked list|data structure/)) {
    return `## Arrays vs Linked Lists\n\n| Feature | Array | Linked List |\n|---------|-------|-------------|\n| Access | O(1) | O(n) |\n| Insert (start) | O(n) | O(1) |\n| Delete | O(n) | O(1) |\n| Memory | Contiguous | Scattered |\n\n**Use Arrays** for random access and cache-friendly ops.\n**Use Linked Lists** for frequent insertions/deletions.\n\n💡 *Think: Which would you use for an undo feature?*`;
  }

  if (q.match(/sql|database|query/)) {
    return `## SQL Fundamentals\n\n\`\`\`sql\nSELECT s.name, c.course_name\nFROM students s\nJOIN enrollments e ON s.id = e.student_id\nJOIN courses c ON e.course_id = c.id\nWHERE s.gpa > 3.5;\n\`\`\`\n\n### JOIN Types:\n- **INNER JOIN** — matching rows only\n- **LEFT JOIN** — all left + matching right\n- **RIGHT JOIN** — all right + matching left\n- **FULL JOIN** — all rows from both\n\n💡 *Practice: Write a query to find students enrolled in more than 3 courses.*`;
  }

  if (q.match(/oop|object oriented/)) {
    return `## OOP Principles\n\n1. **Encapsulation** — Bundle data + methods, restrict direct access\n2. **Inheritance** — Child class inherits parent properties\n3. **Polymorphism** — Same method, different behaviors\n4. **Abstraction** — Hide complexity, show essentials\n\n### Example (Inheritance)\n\`\`\`\nAnimal → Dog, Cat\n- Animal has speak()\n- Dog.speak() → "Bark"\n- Cat.speak() → "Meow"\n\`\`\`\n\n💡 *This is polymorphism in action!*`;
  }

  return `## Great Question! 🎓\n\nRegarding: **"${question}"**\n\n### Study Approach:\n1. 📚 Break it into core concepts\n2. 📝 Review textbook definitions\n3. ✍️ Practice with numerical problems\n4. 🔄 Use the Feynman technique (explain it simply)\n5. 👥 Discuss with classmates\n\n### Helpful Resources:\n- Khan Academy for video explanations\n- GeeksforGeeks for CS topics\n- NCERT Solutions for theory\n\n💡 *Tip: Ask a more specific question for a detailed, step-by-step answer!*\n\n⚠️ *Set your GEMINI_API_KEY in the server .env file for AI-powered answers.*`;
}

// POST /api/ai/ask — Ask a doubt (Protected + Rate Limited)
exports.askDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (question.trim().length > 2000) {
      return res.status(400).json({ message: 'Question is too long (max 2000 characters)' });
    }

    // Call Gemini API (on backend — key is never exposed)
    const answer = await callGemini(question.trim());
    const detectedSubject = subject || detectSubject(question);

    // Save to MongoDB
    const doubt = new Doubt({
      userId: req.user._id,
      question: question.trim(),
      answer,
      subject: detectedSubject,
    });
    await doubt.save();

    res.status(200).json({
      answer,
      subject: detectedSubject,
      doubtId: doubt._id,
      createdAt: doubt.createdAt,
    });
  } catch (err) {
    console.error('AI ask error:', err);

    // If Gemini fails, try fallback
    try {
      const fallback = generateFallbackResponse(req.body.question);
      const detectedSubject = req.body.subject || detectSubject(req.body.question);

      const doubt = new Doubt({
        userId: req.user._id,
        question: req.body.question.trim(),
        answer: fallback,
        subject: detectedSubject,
      });
      await doubt.save();

      return res.status(200).json({
        answer: fallback,
        subject: detectedSubject,
        doubtId: doubt._id,
        createdAt: doubt.createdAt,
        fallback: true,
      });
    } catch (saveErr) {
      console.error('Fallback save error:', saveErr);
    }

    res.status(500).json({ message: 'Failed to get AI response. Please try again.' });
  }
};

// GET /api/ai/history — Get user's doubt history (Protected)
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [doubts, total] = await Promise.all([
      Doubt.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doubt.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json({
      doubts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

// DELETE /api/ai/history/:id — Delete a specific doubt
exports.deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.status(200).json({ message: 'Doubt deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/ai/history — Clear all history
exports.clearHistory = async (req, res) => {
  try {
    await Doubt.deleteMany({ userId: req.user._id });
    res.status(200).json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
