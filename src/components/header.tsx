'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Folder } from 'lucide-react'
import { ThemeToggleButton } from '@/components/theme-toggle'

export function Header({
  user,
}: {
  user?: { name?: string; email?: string; image?: string } | null
}) {
  return (
    <header className="w-full border-b bg-background/95 py-4 px-6 flex items-center justify-between">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight flex items-center gap-2"
      >
        <Folder className="w-5 h-5 text-primary" /> KnowItAll
      </Link>
      <nav className="flex gap-4 items-center">
        <Link
          href="/projects"
          className="text-sm font-medium hover:underline flex items-center gap-1"
        >
          <Folder className="w-4 h-4" /> Projects
        </Link>
        <ThemeToggleButton />
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarImage
                  src={user.image}
                  alt={user.name || user.email || ''}
                />
                <AvatarFallback>
                  {user.name?.[0] || user.email?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/projects/new" className="flex items-center gap-2">
                  <Folder className="w-4 h-4" /> Create Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/api/auth/signout"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button asChild size="sm">
              <Link
                href="/signin"
                scroll={false}
                replace={false}
                shallow={true}
                prefetch={false}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, '', '/signin')
                  document.body.dispatchEvent(
                    new CustomEvent('open-modal', { detail: 'signin' })
                  )
                }}
              >
                Sign in
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link
                href="/register"
                scroll={false}
                replace={false}
                shallow={true}
                prefetch={false}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.pushState({}, '', '/register')
                  document.body.dispatchEvent(
                    new CustomEvent('open-modal', { detail: 'register' })
                  )
                }}
              >
                Sign up
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">
              or continue as guest
            </span>
          </>
        )}
      </nav>
    </header>
  )
}
