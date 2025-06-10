import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Node, Edge, Summary } from '@/validations/research'

// Fetch all nodes for a project
export function useNodes(projectId: string) {
  return useQuery<Node[]>({
    queryKey: ['nodes', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/nodes`)
      if (!res.ok) throw new Error('Failed to fetch nodes')
      return res.json()
    },
  })
}

// Fetch all edges for a project
export function useEdges(projectId: string) {
  return useQuery<Edge[]>({
    queryKey: ['edges', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/edges`)
      if (!res.ok) throw new Error('Failed to fetch edges')
      return res.json()
    },
  })
}

// Fetch all summaries for a project
export function useSummaries(projectId: string) {
  return useQuery<Summary[]>({
    queryKey: ['summaries', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/project/${projectId}/summaries`)
      if (!res.ok) throw new Error('Failed to fetch summaries')
      return res.json()
    },
  })
}

// Mutations for nodes
export function useNodeMutations(projectId: string) {
  const queryClient = useQueryClient()
  return {
    createNode: useMutation({
      mutationFn: async (node: Partial<Node>) => {
        const res = await fetch(`/api/project/${projectId}/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(node),
        })
        if (!res.ok) throw new Error('Failed to create node')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['nodes', projectId] }),
    }),
    updateNode: useMutation({
      mutationFn: async (node: Partial<Node> & { id: string }) => {
        const res = await fetch(`/api/project/${projectId}/nodes/${node.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(node),
        })
        if (!res.ok) throw new Error('Failed to update node')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['nodes', projectId] }),
    }),
    deleteNode: useMutation({
      mutationFn: async (id: string) => {
        const res = await fetch(`/api/project/${projectId}/nodes/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete node')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['nodes', projectId] }),
    }),
  }
}

// Mutations for edges
export function useEdgeMutations(projectId: string) {
  const queryClient = useQueryClient()
  return {
    createEdge: useMutation({
      mutationFn: async (edge: Partial<Edge>) => {
        const res = await fetch(`/api/project/${projectId}/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edge),
        })
        if (!res.ok) throw new Error('Failed to create edge')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['edges', projectId] }),
    }),
    updateEdge: useMutation({
      mutationFn: async (edge: Partial<Edge> & { id: string }) => {
        const res = await fetch(`/api/project/${projectId}/edges/${edge.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edge),
        })
        if (!res.ok) throw new Error('Failed to update edge')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['edges', projectId] }),
    }),
    deleteEdge: useMutation({
      mutationFn: async (id: string) => {
        const res = await fetch(`/api/project/${projectId}/edges/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete edge')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['edges', projectId] }),
    }),
  }
}

// Mutations for summaries
export function useSummaryMutations(projectId: string) {
  const queryClient = useQueryClient()
  return {
    createSummary: useMutation({
      mutationFn: async (summary: Partial<Summary>) => {
        const res = await fetch(`/api/project/${projectId}/summaries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(summary),
        })
        if (!res.ok) throw new Error('Failed to create summary')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['summaries', projectId] }),
    }),
    updateSummary: useMutation({
      mutationFn: async (summary: Partial<Summary> & { id: string }) => {
        const res = await fetch(
          `/api/project/${projectId}/summaries/${summary.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(summary),
          }
        )
        if (!res.ok) throw new Error('Failed to update summary')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['summaries', projectId] }),
    }),
    deleteSummary: useMutation({
      mutationFn: async (id: string) => {
        const res = await fetch(`/api/project/${projectId}/summaries/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete summary')
        return res.json()
      },
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['summaries', projectId] }),
    }),
  }
}
