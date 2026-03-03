export const FEATURE_REGISTRY = {
  dashboard: { route: '/', label: 'Dashboard' },
  people: { route: '/people', label: 'People' },
  interactions: { route: '/interactions', label: 'Interactions' },
  'follow-ups': { route: '/follow-ups', label: 'Follow-Ups' },
  papers: { route: '/papers', label: 'Papers' },
  events: { route: '/events', label: 'Events' },
  calendar: { route: '/calendar', label: 'Calendar' },
  'network-map': { route: '/relationship-map', label: 'Network Map' },
  'ai-studio': { route: '/ai-studio', label: 'AI Studio' },
  'weekly-review': { route: '/weekly-review', label: 'Weekly Review' },
  settings: { route: '/settings', label: 'Settings' },
} as const

export type FeatureId = keyof typeof FEATURE_REGISTRY

export const ALL_FEATURE_IDS = Object.keys(FEATURE_REGISTRY) as FeatureId[]

export const CORE_FEATURES: FeatureId[] = [
  'dashboard',
  'people',
  'interactions',
  'follow-ups',
  'settings',
]

export function getFeatureRoute(featureId: FeatureId): string {
  return FEATURE_REGISTRY[featureId]?.route ?? '/'
}

export function getFeatureLabel(featureId: FeatureId): string {
  return FEATURE_REGISTRY[featureId]?.label ?? featureId
}
