import { useState } from 'react'
import { Download, Trash2, Moon, Sun, Monitor, Target, Palette, Layers, DatabaseBackup } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Theme } from '../types'
import { downloadFile, exportToCSV } from '../lib/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Segmented } from '../components/ui/Segmented'
import { Switch } from '../components/ui/Switch'

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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Configure your study tracker"
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Target size={15} className="text-accent" /> Goals</CardTitle>
            <CardDescription>Targets that drive your daily metrics</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Palette size={15} className="text-accent" /> Appearance</CardTitle>
            <CardDescription>Choose how MyProgress looks on this device</CardDescription>
          </div>
        </CardHeader>
        <Segmented
          ariaLabel="Theme"
          options={themeOptions}
          value={state.settings.theme}
          onChange={value => updateSettings({ theme: value })}
        />
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><Layers size={15} className="text-accent" /> Categories</CardTitle>
            <CardDescription>Enabled categories appear in your daily tasks</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-1">
          {state.categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-2"
            >
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-[14px]"
              >
                {cat.icon}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{cat.name}</span>
              <Switch
                checked={cat.enabled}
                ariaLabel={`Toggle ${cat.name}`}
                onChange={checked =>
                  dispatch({
                    type: 'UPDATE_CATEGORY',
                    payload: { id: cat.id, updates: { enabled: checked } },
                  })
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2"><DatabaseBackup size={15} className="text-accent" /> Data Management</CardTitle>
            <CardDescription>Everything is stored locally in your browser</CardDescription>
          </div>
        </CardHeader>
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
          <p className="mt-3 rounded-[10px] border border-rose/20 bg-rose/10 p-3 text-[13px] text-rose">
            This will permanently delete all your progress. Click again to confirm.
          </p>
        )}
      </Card>
    </div>
  )
}
