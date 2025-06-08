'use client'

import { useEffect, type FC } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getProjects } from '@/server-state/queries_legacy/useProjects'

const PrefetchProjects: FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['projects'],
      queryFn: getProjects,
    })
  }, [queryClient])
  return null
}

export default PrefetchProjects
