import { useState } from 'react'
import { Download, Trash2, Moon, Sun, Monitor } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Theme } from '../types'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { downloadFile, exportToCSV } from '../lib/utils'

export function SettingsPage() {
  const { state, dispatch } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)

  const updateSettings = (updates: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates })
  }

  const exportJSON = () => {
    downloadFile(JSON.stringify(state, null, 2), 'myprogress-export.json', 'application/json')
  }

  const exportCSV = () => {
    const rows = state.problems.map(p => ({
      name: p.name,
      platform: p.platform,
      topic: p.topicId,
      difficulty: p.difficulty,
      status: p.status,
      dateSolved: p.dateSolved ?? '',
      timeMinutes: p.timeTakenMinutes ?? '',
      notes: p.notes ?? '',
      url: p.url ?? '',
    }))
    downloadFile(exportToCSV(rows), 'myprogress-problems.csv', 'text/csv')
  }

  const handleReset = () => {
    if (confirmReset) {
      dispatch({ type: 'RESET_DATA' })
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
    }
  }

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Configure your study tracker</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Goals</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Daily Study Goal (minutes)" type="number" min={0}
            value={state.settings.dailyStudyGoalMinutes}
            onChange={e => updateSettings({ dailyStudyGoalMinutes: parseInt(e.target.value) || 0 })} />
          <Input label="Problems Per Day Goal" type="number" min={0}
            value={state.settings.problemsPerDayGoal}
            onChange={e => updateSettings({ problemsPerDayGoal: parseInt(e.target.value) || 0 })} />
          <Input label="Weekly Problems Goal" type="number" min={0}
            value={state.settings.weeklyProblemsGoal}
            onChange={e => updateSettings({ weeklyProblemsGoal: parseInt(e.target.value) || 0 })} />
          <Input label="Weekly Task Completion Goal (%)" type="number" min={0} max={100}
            value={state.settings.weeklyTaskCompletionGoal}
            onChange={e => updateSettings({ weeklyTaskCompletionGoal: parseInt(e.target.value) || 0 })} />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <div className="flex gap-2">
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                state.settings.theme === value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
        <div className="space-y-2">
          {state.categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-hover)] cursor-pointer">
              <input
                type="checkbox"
                checked={cat.enabled}
                onChange={e => dispatch({
                  type: 'UPDATE_CATEGORY',
                  payload: { id: cat.id, updates: { enabled: e.target.checked } },
                })}
                className="w-4 h-4 rounded accent-[var(--color-accent)]"
              />
              <span>{cat.icon}</span>
              <span className="text-sm text-[var(--color-text-primary)]">{cat.name}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportJSON}>
            <Download size={16} /> Export JSON
          </Button>
          <Button variant="secondary" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </Button>
          <Button variant="danger" onClick={handleReset}>
            <Trash2 size={16} />
            {confirmReset ? 'Confirm Reset?' : 'Reset All Data'}
          </Button>
        </div>
        {confirmReset && (
          <p className="mt-3 text-sm text-red-500">This will permanently delete all your progress. Click again to confirm.</p>
        )}
      </Card>
    </div>
  )
}
