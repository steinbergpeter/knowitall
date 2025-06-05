import ProjectsClient from '@/app/projects/_components/projects-client'

export const metadata = {
  title: 'KnowItAll | Projects',
}

export default function ProjectsPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-12">
      <ProjectsClient />
    </main>
  )
}
