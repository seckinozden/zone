import { useEffect, useState } from 'react'
import { useSettings, useUpdateSettings } from '../../api/hooks'

export function WellnessSettings() {
  const { data } = useSettings()
  const update = useUpdateSettings()
  const [budget, setBudget] = useState('14000')

  useEffect(() => {
    if (data) setBudget(data.weeklyCalorieBudget.toString())
  }, [data])

  async function save() {
    await update.mutateAsync({ weeklyCalorieBudget: parseInt(budget, 10) })
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold tracking-tight mb-2">Wellness</h2>
      <p className="text-sm text-on-surface-variant mb-6">Weekly nutrition settings.</p>
      <label className="block mb-5">
        <div className="label-caps mb-1">Weekly calorie budget</div>
        <input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full bg-surface-lowest border border-divider rounded-lg p-3 outline-none focus:border-brand" />
      </label>
      <button onClick={save} className="px-5 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-semibold">Save</button>
    </div>
  )
}
