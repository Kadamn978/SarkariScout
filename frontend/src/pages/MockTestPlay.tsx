import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Question {
  id: string; questionText: string; optionA: string; optionB: string;
  optionC: string; optionD: string; marks: number;
}

interface TestDetail {
  id: string; title: string; description: string; examFamily: string;
  totalQuestions: number; totalMarks: number; durationMinutes: number;
  questions: Question[];
}

interface Result {
  score: number; totalMarks: number; correctCount: number;
  totalAnswered: number; percentage: number; timeTakenSec: number;
}

export default function MockTestPlay() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<TestDetail | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    loadTest()
  }, [id])

  useEffect(() => {
    if (!started || timeLeft <= 0 || result) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, timeLeft, result])

  async function loadTest() {
    try {
      const res = await api.get(`/mock-tests/${id}`)
      setTest(res.data)
      setTimeLeft(res.data.durationMinutes * 60)
    } catch (e) {
      /* console.error('Failed to load test', e) */
    }
  }

  async function handleStart() {
    try {
      const res = await api.post(`/mock-tests/${id}/start`)
      setAttemptId(res.data.id)
      setStarted(true)
    } catch (e) {
      /* console.error('Failed to start test', e) */
    }
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || !attemptId || result) return
    setSubmitting(true)
    try {
      const timeTaken = test ? test.durationMinutes * 60 - timeLeft : 0
      const res = await api.put(`/mock-tests/attempts/${attemptId}/submit`, {
        answers,
        timeTakenSec: timeTaken,
      })
      setResult(res.data)
    } catch (e) {
      /* console.error('Failed to submit', e) */
    } finally {
      setSubmitting(false)
    }
  }, [submitting, attemptId, result, answers, timeLeft, test])

  function selectAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">Test Result</h1>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">{result.score}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Score / {result.totalMarks}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{result.percentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">{result.correctCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correct / {test.totalQuestions}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-3xl font-bold text-orange-600">{formatTime(result.timeTakenSec)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Time Taken</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/mock-tests')} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              All Tests
            </button>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Retake
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">{test.examFamily}</span>
          <h1 className="text-2xl font-bold mt-4 mb-2 dark:text-white">{test.title}</h1>
          {test.description && <p className="text-gray-600 dark:text-gray-400 mb-6">{test.description}</p>}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{test.totalQuestions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{test.totalMarks}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{test.durationMinutes}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minutes</p>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">Timer starts when you click Begin. Once started, the test cannot be paused.</p>
          </div>
          <button onClick={handleStart} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Begin Test
          </button>
        </div>
      </div>
    )
  }

  const question = test.questions[currentQ]
  const answered = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">{test.title}</h2>
          <div className="flex items-center gap-4">
            <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{answered}/{test.totalQuestions} answered</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full shrink-0">
              Q{currentQ + 1} ({question.marks} mark{question.marks > 1 ? 's' : ''})
            </span>
            <p className="text-gray-900 dark:text-white text-lg leading-relaxed">{question.questionText}</p>
          </div>

          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const key = `option${opt}`
              const selected = answers[question.id] === opt
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(question.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="font-medium mr-3">{opt}.</span>
                  {(question as any)[key]}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-6 py-3 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Previous
          </button>

          <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {test.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition shrink-0 ${
                  i === currentQ ? 'bg-blue-600 text-white' :
                  answers[test.questions[i].id] ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQ === test.questions.length - 1 ? (
            <button
              onClick={() => { if (window.confirm('Submit test?')) handleSubmit() }}
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(Math.min(test.questions.length - 1, currentQ + 1))}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
