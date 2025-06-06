import { type CreatedProject } from '@/validations/project'
import Link from 'next/link'

type ProjectInListProps = {
  project: CreatedProject
  userId?: string
}
const ProjectInList = ({ project, userId }: ProjectInListProps) => {
  const isOwner = userId && project.ownerId === userId
  const canOpen = isOwner || project.isPublic
  return (
    <li key={project.id} className="border rounded p-3 flex flex-col bg-card">
      {canOpen ? (
        <Link
          href={`/projects/${project.id}`}
          className="font-semibold text-lg text-blue-600 hover:underline"
        >
          {project.name}
        </Link>
      ) : (
        <span className="font-semibold text-lg text-gray-400 cursor-not-allowed">
          {project.name}
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        {project.description}
      </span>
      <span className="text-xs text-gray-400">
        {project.isPublic ? 'Public' : 'Private'}
      </span>
    </li>
  )
}

export default ProjectInList
