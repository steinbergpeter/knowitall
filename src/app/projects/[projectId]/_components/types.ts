export type Tabs = 'queries' | 'documents' | 'graph' | 'settings'

export const TABS = [
  { key: 'queries', label: 'Queries' },
  { key: 'documents', label: 'Documents' },
  { key: 'graph', label: 'Graph' },
  { key: 'settings', label: 'Settings' },
] as const
