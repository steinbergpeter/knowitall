import { type CreatedProject } from '@/validations/project'
import Link from 'next/link'

type ProjectInListProps = {
  project: CreatedProject
  userId?: string
}
const ProjectInList = ({ project, userId }: ProjectInListProps) => {
  return (
    <li key={project.id} className="border rounded p-3 flex flex-col bg-card">
      <span className="font-semibold text-lg">{project.name}</span>
      <span className="text-sm text-muted-foreground">
        {project.description}
      </span>
      <span className="text-xs text-gray-400">
        {project.isPublic ? 'Public' : 'Private'}
      </span>
      {userId && project.ownerId === userId && (
        <div className="mt-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="text-blue-600 underline text-sm"
          >
            Edit
          </Link>
        </div>
      )}
    </li>
  )
}

export default ProjectInList
