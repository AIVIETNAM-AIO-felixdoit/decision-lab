import {createClient} from '@sanity/client'
import type {Decision} from './data'

// Project IDs are public identifiers. A fallback keeps static deployments working
// without putting a write-capable token into browser code.
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'f2yoycw9'
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'

export const isSanityConfigured = Boolean(projectId && projectId !== 'your-project-id')

const client = isSanityConfigured ? createClient({
  projectId,
  dataset,
  apiVersion: '2026-09-01',
  useCdn: false,
}) : null

export async function getDecisions(): Promise<Decision[]> {
  if (!client) return []
  const decisions = await client.fetch<Decision[]>(`*[_type == "decision"] | order(_updatedAt desc) {
    _id, title, description, category, "updatedAt": _updatedAt,
    criteria[]{_key, name, weight, description},
    options[]{_key, name, summary, color, scores[]{criterionKey, value, note}}
  }`)
  return decisions.map((decision) => ({
    ...decision,
    criteria: decision.criteria || [],
    options: (decision.options || []).map((option) => ({...option, scores: option.scores || []})),
  }))
}
