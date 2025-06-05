import { ThemeToggleButton } from '@/components/header/theme-toggle'
import { Folder } from 'lucide-react'
import Link from 'next/link'
import UserButton from './user-button'

export function Header({
  user,
}: {
  user?: { name?: string; email?: string; image?: string } | null
}) {
  return (
    <header className="w-full border-b bg-background/95 py-4 px-6 flex items-center justify-between min-h-[64px]">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight flex items-center gap-2 min-w-[180px]"
      >
        <Folder className="w-5 h-5 text-primary" /> KnowItAll
      </Link>
      <nav className="flex items-center justify-end flex-1 min-w-0">
        <div className="flex gap-4 items-center">
          <Link
            href="/projects"
            className="text-sm font-medium hover:underline flex items-center gap-1"
          >
            <Folder className="w-4 h-4" /> Projects
          </Link>
          <ThemeToggleButton />
          <UserButton user={user} />
        </div>
      </nav>
    </header>
  )
}
