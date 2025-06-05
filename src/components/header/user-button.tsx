'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Folder, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

type UserButtonProps = {
  user?: { name?: string; email?: string; image?: string } | null
}

const UserButton = ({ user }: UserButtonProps) => {
  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage
            src={user.image}
            alt={user.name || user.email || ''}
            referrerPolicy="no-referrer"
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
          <Link href="/api/auth/signout" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button asChild size="sm">
      <Link href="/signin">Sign in</Link>
    </Button>
  )
}

export default UserButton
