import ProjectBreadcrumbs from '@/components/project-breadcrumbs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProjectHeaderProps {
  projectId: string
  name: string
  description: string
  owner: { name?: string; email?: string } | null
  isPublic: boolean
  counts: { documents: number; summaries: number; queries: number }
  children?: React.ReactNode
}

export default function ProjectHeader({
  projectId,
  name,
  description,
  owner,
  isPublic,
  counts,
  children,
}: ProjectHeaderProps) {
  return (
    <div className="mb-8 w-full">
      <ProjectBreadcrumbs projectId={projectId} projectName={name} />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <p className="text-gray-600 mb-2">{description}</p>
          {/** TAB BAR */}
          <Tabs defaultValue="queries" className="w-full mt-4">
            <TabsList>
              <TabsTrigger value="queries">Queries</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            {children}
          </Tabs>
        </div>
        {/** METADATA BOX */}
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
