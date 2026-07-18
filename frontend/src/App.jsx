import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const MAX_LEN = 512

const DOC_LINKS = [
  {
    href: '/api/task',
    title: 'Задание (task.md)',
    label: 'Task',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2.5L18.5 9H14zM8 13h8v2H8zm0 4h8v2H8zm0-8h4v2H8z"
        />
      </svg>
    ),
  },
  {
    href: '/api/launch',
    title: 'Запуск (launchdoc.md)',
    label: 'Launch',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2c.4 4.2 2.8 7.4 7 9-4.2 1.6-6.6 4.8-7 9-.4-4.2-2.8-7.4-7-9 4.2-1.6 6.6-4.8 7-9zm0 5.2C10.7 9.2 9.2 10.7 7.2 12c2 1.3 3.5 2.8 4.8 4.8 1.3-2 2.8-3.5 4.8-4.8-2-1.3-3.5-2.8-4.8-4.8z"
        />
      </svg>
    ),
  },
  {
    href: '/api/promts',
    title: 'Разговор (ai_conversation.md)',
    label: 'Conversation',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4v2h12V8zm0 4v2h8v-2z"
        />
      </svg>
    ),
  },
]

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [thanks, setThanks] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/questions`)
      if (!res.ok) throw new Error('Не удалось загрузить вопросы')
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  function updateAnswer(number, value) {
    const trimmed = value.slice(0, MAX_LEN)
    setItems((prev) =>
      prev.map((item) =>
        item.number === number
          ? { ...item, answer: trimmed, answered: trimmed.trim() !== '' }
          : item,
      ),
    )
    setThanks(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      if (!res.ok) throw new Error('Не удалось отправить ответы')
      setThanks(true)
      await loadQuestions()
    } catch (err) {
      setError(err.message || 'Ошибка отправки')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="title-row">
          <p className="eyebrow">Мини-анкета</p>
          <div className="header-right">
            <p className="executor">Исполнитель: Васильева Ольга. 2026</p>
            <nav className="doc-icons" aria-label="Документы">
              {DOC_LINKS.map((link) => (
                <a
                  key={link.href}
                  className="doc-icon"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  title={link.title}
                  aria-label={link.title}
                >
                  {link.icon}
                  <span className="sr-only">{link.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
        <h1>Пять веселых вопросов</h1>
        <p className="lead">Отвечайте как угодно. Все поля необязательные, максимум 512 символов.</p>
      </header>

      {loading && <p className="status">Загружаем вопросы…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <form className="form" onSubmit={handleSubmit}>
          {items.map((item) => (
            <label
              key={item.number}
              className={`field ${item.answered ? 'answered' : ''}`}
            >
              <span className="q">
                {item.number}. {item.question}
              </span>
              <textarea
                value={item.answer || ''}
                maxLength={MAX_LEN}
                rows={3}
                placeholder="Ваш ответ (необязательно)"
                onChange={(e) => updateAnswer(item.number, e.target.value)}
              />
              <span className="counter">
                {(item.answer || '').length}/{MAX_LEN}
              </span>
            </label>
          ))}

          <button type="submit" disabled={saving}>
            {saving ? 'Отправляем…' : 'Отправить ответы'}
          </button>
        </form>
      )}

      {thanks && <p className="thanks">Спасибо!</p>}
    </main>
  )
}
