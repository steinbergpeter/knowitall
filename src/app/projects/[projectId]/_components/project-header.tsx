import ProjectBreadcrumbs from '@/components/project-breadcrumbs'

interface ProjectHeaderProps {
  projectId: string
  name: string
  description: string
  owner: { name?: string; email?: string } | null
  isPublic: boolean
  counts: { documents: number; summaries: number; queries: number }
  activeTab: 'queries' | 'documents' | 'graph' | 'settings'
  setActiveTab: (tab: 'queries' | 'documents' | 'graph' | 'settings') => void
  children?: React.ReactNode
}

const TABS = [
  { key: 'queries', label: 'Queries' },
  { key: 'documents', label: 'Documents' },
  { key: 'graph', label: 'Graph' },
  { key: 'settings', label: 'Settings' },
] as const

export default function ProjectHeader({
  projectId,
  name,
  description,
  owner,
  isPublic,
  counts,
  activeTab,
  setActiveTab,
  children,
}: ProjectHeaderProps) {
  return (
    <div className="mb-2 w-full">
      <ProjectBreadcrumbs projectId={projectId} projectName={name} />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <p className="text-gray-600 mb-2">{description}</p>
          {/* Custom Tab Bar */}
          <div className="flex gap-2 mt-4 border-b border-gray-300">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 font-medium rounded-t-md focus:outline-none transition-colors duration-150 ${
                  activeTab === tab.key
                    ? 'bg-white border-x border-t border-gray-300 text-purple-700 -mb-px'
                    : 'bg-gray-100 text-gray-500 hover:text-purple-700'
                }`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          {children}
        </div>
        {/* METADATA BOX */}
        <div className="min-w-[220px] bg-gray-50 border rounded-lg p-4 text-sm text-gray-800 flex flex-col gap-1">
          <div>
            <span className="font-semibold">Owner:</span>{' '}
            {owner?.name || owner?.email || 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Privacy:</span>{' '}
            {isPublic ? 'Public' : 'Private'}
          </div>
          <div>
            <span className="font-semibold">Documents:</span> {counts.documents}
          </div>
          <div>
            <span className="font-semibold">Summaries:</span> {counts.summaries}
          </div>
          <div>
            <span className="font-semibold">Queries:</span> {counts.queries}
          </div>
        </div>
      </div>
    </div>
  )
}
