import ProjectDocumentList from './_components/project-document-list'
import ProjectDetailClient from './_components/project-detail-client'

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { projectId } = await props.params
  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12">
      <ProjectDetailClient projectId={projectId} />
      <ProjectDocumentList projectId={projectId} />
    </main>
  )
}
