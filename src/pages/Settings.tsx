import { useState } from 'react'
import { Download, Trash2, Moon, Sun, Monitor, Target, Palette, Layers, DatabaseBackup, Shield } from 'lucide-react'
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
    { value: 'light',  icon: Sun,     label: 'Light' },
    { value: 'dark',   icon: Moon,    label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  const enabledCount  = state.categories.filter(c => c.enabled).length
  const disabledCount = state.categories.length - enabledCount

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Configure your study tracker"
      />

      {/* Goals */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target size={15} className="text-accent" />
              Study Goals
            </CardTitle>
            <CardDescription>Targets that drive your daily metrics and progress bars</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Daily Study Goal (minutes)"
            type="number"
            min={0}
            value={state.settings.dailyStudyGoalMinutes}
            onChange={e => updateSettings({ dailyStudyGoalMinutes: parseInt(e.target.value) || 0 })}
            hint="Recommended: 90–180 minutes per day"
          />
          <Input
            label="Problems Per Day Goal"
            type="number"
            min={0}
            value={state.settings.problemsPerDayGoal}
            onChange={e => updateSettings({ problemsPerDayGoal: parseInt(e.target.value) || 0 })}
            hint="Realistic starting point: 3–5 problems"
          />
          <Input
            label="Weekly Problems Goal"
            type="number"
            min={0}
            value={state.settings.weeklyProblemsGoal}
            onChange={e => updateSettings({ weeklyProblemsGoal: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Weekly Task Completion Goal (%)"
            type="number"
            min={0}
            max={100}
            value={state.settings.weeklyTaskCompletionGoal}
            onChange={e => updateSettings({ weeklyTaskCompletionGoal: parseInt(e.target.value) || 0 })}
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette size={15} className="text-accent" />
              Appearance
            </CardTitle>
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

      {/* Categories */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers size={15} className="text-accent" />
              Categories
            </CardTitle>
            <CardDescription>
              {enabledCount} active · {disabledCount} disabled — enabled categories appear in daily tasks
            </CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-0.5">
          {state.categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-2"
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

      {/* Data management */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <DatabaseBackup size={15} className="text-accent" />
              Data Management
            </CardTitle>
            <CardDescription>All data is stored locally in your browser — nothing leaves your device</CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-[11.5px] font-semibold text-mint">
            <Shield size={11} />
            Local only
          </span>
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
            {confirmReset ? 'Confirm — wipe all data?' : 'Reset All Data'}
          </Button>
        </div>
        {confirmReset && (
          <div className="mt-4 rounded-xl border border-rose/20 bg-rose/8 p-4">
            <p className="text-[13px] font-medium text-rose">
              ⚠️ This will permanently delete all your progress, problems, and records.
              Click the button again to confirm.
            </p>
            <button
              onClick={() => setConfirmReset(false)}
              className="mt-2 text-[12.5px] font-medium text-ink-3 underline transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
