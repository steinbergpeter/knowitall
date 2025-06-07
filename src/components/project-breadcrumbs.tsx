import Link from 'next/link'

interface ProjectBreadcrumbsProps {
  projectId: string
  projectName: string
  documentTitle?: string
}

export default function ProjectBreadcrumbs({
  projectId,
  projectName,
  documentTitle,
}: ProjectBreadcrumbsProps) {
  return (
    <nav className="mb-4 text-sm text-gray-500 flex gap-2 items-center">
      <Link href="/projects" className="hover:underline text-blue-600">
        Projects
      </Link>
      <span>/</span>
      <Link
        href={`/projects/${projectId}`}
        className="hover:underline text-blue-600"
      >
        {projectName}
      </Link>
      {documentTitle && (
        <>
          <span>/</span>
          <span className="text-gray-700 font-medium">{documentTitle}</span>
        </>
      )}
    </nav>
  )
}
