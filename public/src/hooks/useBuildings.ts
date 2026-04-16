import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBuilding,
  deleteBuilding,
  listBuildings,
  updateBuilding,
} from '../api/buildings'
import type { BuildingInput } from '../types'

const KEY = ['buildings'] as const

export function useBuildings() {
  return useQuery({
    queryKey: KEY,
    queryFn: listBuildings,
  })
}

export function useCreateBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: BuildingInput) => createBuilding(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useUpdateBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BuildingInput }) =>
      updateBuilding(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteBuilding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBuilding(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}
