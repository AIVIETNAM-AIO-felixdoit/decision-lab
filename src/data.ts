export type Criterion = { _key: string; name: string; weight: number; description?: string }
export type Score = { criterionKey: string; value: number; note?: string }
export type Option = { _key: string; name: string; summary: string; color: 'coral' | 'blue' | 'green' | 'purple'; scores: Score[] }
export type Decision = { _id: string; title: string; description: string; category: string; criteria: Criterion[]; options: Option[]; updatedAt?: string }

export const sampleDecision: Decision = {
  _id: 'sample',
  title: 'Where should I work next?',
  description: 'A practical look at three paths for my next chapter. Adjust what matters most to see how the outcome changes.',
  category: 'Career move',
  updatedAt: '2026-10-04T09:00:00Z',
  criteria: [
    {_key: 'growth', name: 'Room to grow', weight: 5, description: 'Learning, mentorship, and future opportunities'},
    {_key: 'balance', name: 'Work-life balance', weight: 4, description: 'Time and energy outside work'},
    {_key: 'pay', name: 'Compensation', weight: 3, description: 'Salary and benefits'},
    {_key: 'impact', name: 'Meaningful impact', weight: 4, description: 'How much the work matters to me'},
  ],
  options: [
    {_key: 'startup', name: 'Join a startup', summary: 'Fast learning, bigger ownership', color: 'coral', scores: [
      {criterionKey: 'growth', value: 5, note: 'Broad role and steep learning curve'},
      {criterionKey: 'balance', value: 2, note: 'Higher intensity and less predictability'},
      {criterionKey: 'pay', value: 3, note: 'Lower base, possible equity upside'},
      {criterionKey: 'impact', value: 5, note: 'Direct influence on the product'},
    ]},
    {_key: 'company', name: 'Join a larger team', summary: 'Structure, stability, and support', color: 'blue', scores: [
      {criterionKey: 'growth', value: 4, note: 'Strong mentorship and defined progression'},
      {criterionKey: 'balance', value: 4, note: 'More predictable hours'},
      {criterionKey: 'pay', value: 5, note: 'Strong salary and benefits'},
      {criterionKey: 'impact', value: 3, note: 'Impact is shared across a larger team'},
    ]},
    {_key: 'freelance', name: 'Go independent', summary: 'Freedom to choose my own work', color: 'green', scores: [
      {criterionKey: 'growth', value: 4, note: 'Learn through varied client work'},
      {criterionKey: 'balance', value: 3, note: 'Flexible schedule, inconsistent workload'},
      {criterionKey: 'pay', value: 3, note: 'Potential upside with income variability'},
      {criterionKey: 'impact', value: 4, note: 'Choose aligned clients and projects'},
    ]},
  ],
}

export function weightedScore(option: Option, criteria: Criterion[]): number {
  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0)
  if (!totalWeight) return 0
  return Math.round(criteria.reduce((sum, item) => {
    const score = option.scores.find((entry) => entry.criterionKey === item._key || entry.criterionKey === item.name)?.value || 0
    return sum + score * item.weight
  }, 0) / (totalWeight * 5) * 100)
}
