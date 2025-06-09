'use client'

import { useChatList } from '@/server-state/chats/useChatQueries'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { useDeleteChat } from '@/server-state/chats/useChatMutations'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'

interface ChatListProps {
  projectId: string
  selectedChatId: string | null
  onSelectChat: (chatId: string | null) => void
  onNewChat: () => void
  isCreatingChat?: boolean
}

export default function ChatList({
  projectId,
  selectedChatId,
  onSelectChat,
  onNewChat,
  isCreatingChat,
}: ChatListProps) {
  const { data: chats, isLoading, isError } = useChatList(projectId)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const queryClient = useQueryClient()
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat({
    onSuccess: () => {
      setShowDialog(false)
      setDeleteTarget(null)
      // If the deleted chat was selected, clear selection
      if (deleteTarget === selectedChatId) onSelectChat(null)
      // Invalidate chat list for this project
      queryClient.invalidateQueries({ queryKey: ['chats', projectId] })
      // Invalidate queries for the deleted chat
      if (deleteTarget) {
        queryClient.invalidateQueries({ queryKey: ['chat', deleteTarget] })
      }
      // Invalidate project detail (query count)
      queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] })
    },
  })

  if (isLoading) return <div className="p-4">Loading chats...</div>
  if (isError)
    return <div className="p-4 text-red-500">Failed to load chats.</div>
  if (!chats || chats.length === 0)
    return <div className="p-4">No chats yet.</div>

  return (
    <div className="flex flex-col w-80 min-w-[12rem] max-w-xs h-[40rem] ml-4">
      {/* HEADING */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="font-semibold text-lg">Previous Chats</span>
        <Button onClick={onNewChat} disabled={isCreatingChat} type="button">
          {isCreatingChat ? 'Creating...' : 'New Chat'}
        </Button>
      </div>
      {/* LIST */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {chats.map((chat: { id: string; title: string }) => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between cursor-pointer px-2 py-1 rounded transition-colors truncate ${
              chat.id === selectedChatId
                ? 'bg-primary/10 text-primary font-semibold'
                : 'hover:bg-muted/70 text-muted-foreground'
            }`}
            title={chat.title}
          >
            <span
              className="truncate flex-1"
              onClick={() => onSelectChat(chat.id)}
            >
              {chat.title || `Chat ${chat.id.slice(-4)}`}
            </span>
            <Dialog
              open={showDialog && deleteTarget === chat.id}
              onOpenChange={(open) => {
                setShowDialog(open)
                if (!open) setDeleteTarget(null)
              }}
            >
              <DialogTrigger asChild>
                <button
                  className="ml-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-70 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(chat.id)
                    setShowDialog(true)
                  }}
                  aria-label="Delete chat"
                  tabIndex={0}
                >
                  <Trash2 size={16} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Chat?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete this chat and all its queries.
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <button
                      className="px-4 py-2 rounded bg-muted"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <Button
                    className="px-4 py-2 rounded bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => deleteChat(chat.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
}
