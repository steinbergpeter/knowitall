import { DocumentUploadForm } from './_components/document-upload-form'
import { ProjectDocumentList } from './_components/project-document-list'
import ProjectDetailClient from './_components/project-detail-client'

interface ProjectDetailPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { projectId } = props.params
  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12">
      <ProjectDetailClient projectId={projectId} />
      <DocumentUploadForm projectId={projectId} />
      <ProjectDocumentList projectId={projectId} />
    </main>
  )
}
