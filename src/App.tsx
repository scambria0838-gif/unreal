import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'unreal.tasks.v1'

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t) => typeof t?.id === 'string' && typeof t?.title === 'string',
    )
  } catch {
    return []
  }
}

function createTask(title: string): Task {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    title,
    completed: false,
    createdAt: Date.now(),
  }
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const remaining = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks],
  )

  const visibleTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed)
      case 'completed':
        return tasks.filter((t) => t.completed)
      default:
        return tasks
    }
  }, [tasks, filter])

  function addTask() {
    const title = draft.trim()
    if (!title) return
    setTasks((prev) => [createTask(title), ...prev])
    setDraft('')
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.completed))
  }

  const filters: Filter[] = ['all', 'active', 'completed']

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <div className="brand">
            <span className="logo" aria-hidden>
              ▲
            </span>
            <div>
              <h1>Unreal</h1>
              <p className="tagline">A tiny task board that remembers.</p>
            </div>
          </div>
          <div className="counter" aria-live="polite">
            <span className="counter-value" data-testid="remaining-count">
              {remaining}
            </span>
            <span className="counter-label">
              {remaining === 1 ? 'task left' : 'tasks left'}
            </span>
          </div>
        </header>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault()
            addTask()
          }}
        >
          <input
            className="composer-input"
            placeholder="What needs to happen?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New task title"
          />
          <button className="composer-button" type="submit" disabled={!draft.trim()}>
            Add task
          </button>
        </form>

        <nav className="filters" aria-label="Filter tasks">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </nav>

        <ul className="task-list" data-testid="task-list">
          {visibleTasks.length === 0 && (
            <li className="empty">
              {tasks.length === 0
                ? 'No tasks yet — add your first one above.'
                : 'Nothing here for this filter.'}
            </li>
          )}
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className={`task ${task.completed ? 'is-completed' : ''}`}
            >
              <label className="task-main">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${
                    task.completed ? 'active' : 'complete'
                  }`}
                />
                <span className="task-title">{task.title}</span>
              </label>
              <button
                type="button"
                className="task-delete"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete "${task.title}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <footer className="footer">
          <span>{tasks.length} total</span>
          <button
            type="button"
            className="link"
            onClick={clearCompleted}
            disabled={tasks.every((t) => !t.completed)}
          >
            Clear completed
          </button>
        </footer>
      </div>
    </div>
  )
}

export default App
