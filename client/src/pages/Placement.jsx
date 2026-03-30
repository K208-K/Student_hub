import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { PageHeader, Card } from '../components/UI';
import { HiOutlineLightBulb, HiOutlineCheck, HiOutlineX, HiOutlineDocumentDownload } from 'react-icons/hi';

export default function Placement() {
  const { dark } = useTheme();
  const [tab, setTab] = useState('aptitude');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const questions = [
    { q: 'A train 150m long passes a pole in 15 seconds. What is its speed?', opts: ['10 m/s', '15 m/s', '20 m/s', '25 m/s'], ans: 0, exp: 'Speed = Distance/Time = 150/15 = 10 m/s' },
    { q: 'If 6 men can do a piece of work in 20 days, how many men are needed to do it in 12 days?', opts: ['8', '10', '12', '15'], ans: 1, exp: '6 × 20 = x × 12; x = 120/12 = 10 men' },
    { q: 'The average of first 50 natural numbers is:', opts: ['25', '25.5', '26', '26.5'], ans: 1, exp: 'Average = (n+1)/2 = 51/2 = 25.5' },
    { q: 'What is the HCF of 36 and 48?', opts: ['6', '8', '12', '24'], ans: 2, exp: '36=2²×3²; 48=2⁴×3; HCF=2²×3 = 12' },
    { q: 'A car covers 360 km in 4 hours. Speed in m/s?', opts: ['20', '25', '30', '35'], ans: 1, exp: '90 km/h × 5/18 = 25 m/s' },
  ];

  const interviewQs = [
    { cat: 'Technical', qs: ['Explain stack vs heap memory', 'Time complexity of quicksort?', 'ACID properties in databases', 'TCP vs UDP', 'What is Virtual Memory?'] },
    { cat: 'HR', qs: ['Tell me about yourself', 'Strengths and weaknesses?', 'Where do you see yourself in 5 years?', 'Why should we hire you?', 'Describe a challenging situation'] },
    { cat: 'Coding', qs: ['Reverse a linked list', 'Find missing number in 1 to N', 'Implement binary search', 'Check palindrome string', 'Maximum subarray sum'] },
  ];

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    setAnswered(p => p + 1);
    if (idx === questions[currentQ].ans) setScore(p => p + 1);
  };

  const nextQ = () => {
    setCurrentQ(p => (p + 1) % questions.length);
    setSelected(null);
    setShowAnswer(false);
  };

  const tabs = [
    { id: 'aptitude', label: '🧮 Aptitude' },
    { id: 'interview', label: '💼 Interview Q&A' },
    { id: 'coding', label: '💻 Coding Tracker' },
    { id: 'resume', label: '📄 Resume' },
  ];

  return (
    <div>
      <PageHeader title="Placement Prep" subtitle="Get ready for campus placements" icon={HiOutlineLightBulb} />

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${tab === t.id ? 'gradient-primary text-white' : dark ? 'bg-surface-800 text-surface-700' : 'bg-surface-100 text-surface-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Aptitude */}
      {tab === 'aptitude' && (
        <div>
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${dark ? 'text-surface-700' : 'text-surface-700'}`}>Question {currentQ + 1}/{questions.length}</span>
              <span className="text-xs font-bold text-primary-400">Score: {score}/{answered}</span>
            </div>
            <h3 className={`text-lg font-semibold mb-6 ${dark ? 'text-white' : 'text-surface-900'}`}>{questions[currentQ].q}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions[currentQ].opts.map((opt, i) => (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(i)}
                  className={`p-4 rounded-xl text-left text-sm font-medium transition-all border-2
                    ${showAnswer
                      ? i === questions[currentQ].ans
                        ? 'border-success-400 bg-success-400/10 text-success-400'
                        : i === selected
                          ? 'border-danger-400 bg-danger-400/10 text-danger-400'
                          : dark ? 'border-surface-800 text-surface-700' : 'border-surface-200 text-surface-700'
                      : dark
                        ? 'border-surface-800 text-white hover:border-primary-500/50'
                        : 'border-surface-200 text-surface-900 hover:border-primary-500/50'
                    }`}
                >
                  <span className="mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>{opt}
                  {showAnswer && i === questions[currentQ].ans && <HiOutlineCheck className="inline ml-2" />}
                  {showAnswer && i === selected && i !== questions[currentQ].ans && <HiOutlineX className="inline ml-2" />}
                </motion.button>
              ))}
            </div>
            {showAnswer && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl ${dark ? 'bg-primary-500/10' : 'bg-primary-50'}`}>
                <p className={`text-sm ${dark ? 'text-primary-300' : 'text-primary-700'}`}>💡 {questions[currentQ].exp}</p>
              </motion.div>
            )}
            {showAnswer && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextQ} className="btn-primary w-full mt-4">
                Next Question →
              </motion.button>
            )}
          </Card>
        </div>
      )}

      {/* Interview */}
      {tab === 'interview' && (
        <div className="space-y-4">
          {interviewQs.map((cat, i) => (
            <Card key={i} delay={i * 0.1}>
              <h3 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-surface-900'}`}>{cat.cat} Questions</h3>
              <div className="space-y-2">
                {cat.qs.map((q, j) => (
                  <div key={j} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? 'bg-surface-800/50' : 'bg-surface-50'}`}>
                    <span className="text-xs text-primary-400 font-bold">{j + 1}</span>
                    <p className={`text-sm ${dark ? 'text-surface-700' : 'text-surface-700'}`}>{q}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Coding */}
      {tab === 'coding' && (
        <Card>
          <h3 className={`font-semibold mb-4 ${dark ? 'text-white' : 'text-surface-900'}`}>Coding Progress Tracker</h3>
          {[
            { topic: 'Arrays & Strings', solved: 28, total: 40 },
            { topic: 'Linked Lists', solved: 15, total: 25 },
            { topic: 'Trees & Graphs', solved: 10, total: 30 },
            { topic: 'Dynamic Programming', solved: 8, total: 35 },
            { topic: 'Sorting & Searching', solved: 20, total: 20 },
          ].map((item, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className={dark ? 'text-white' : 'text-surface-900'}>{item.topic}</span>
                <span className={`text-xs ${dark ? 'text-surface-700' : 'text-surface-700'}`}>{item.solved}/{item.total}</span>
              </div>
              <div className={`w-full h-3 rounded-full overflow-hidden ${dark ? 'bg-surface-800' : 'bg-surface-200'}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(item.solved / item.total) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #3b82f6, #8b5cf6)` }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Resume */}
      {tab === 'resume' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Software Developer', 'Data Analyst', 'Full Stack Dev', 'ML Engineer'].map((template, i) => (
            <Card key={i} delay={i * 0.1} className="text-center">
              <div className={`w-full h-40 rounded-xl mb-4 flex items-center justify-center ${dark ? 'bg-surface-800' : 'bg-surface-100'}`}>
                <HiOutlineDocumentDownload className={`text-4xl ${dark ? 'text-surface-700' : 'text-surface-200'}`} />
              </div>
              <h3 className={`font-semibold mb-1 ${dark ? 'text-white' : 'text-surface-900'}`}>{template}</h3>
              <p className={`text-xs mb-3 ${dark ? 'text-surface-700' : 'text-surface-700'}`}>ATS-friendly template</p>
              <motion.button whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-xl text-sm font-medium ${dark ? 'bg-primary-500/15 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                Download Template
              </motion.button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
