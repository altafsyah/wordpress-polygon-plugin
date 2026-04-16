import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type {
  ApiCreateResponse,
  ApiListResponse,
  BuildingInput,
  CategoryWithBuildings,
  GeoJSONInput,
} from '../types'

function cleanGeometry(geometry: GeoJSONInput): GeoJSONInput {
  if (typeof geometry === 'string') {
    return geometry.replace(/^"|"$/g, '').replace(/\\"/g, '"')
  }
  return geometry
}

export async function listBuildings(): Promise<CategoryWithBuildings[]> {
  const res = await apiGet<ApiListResponse<CategoryWithBuildings>>('/buildings')
  return res.data ?? []
}

export function createBuilding(input: BuildingInput): Promise<ApiCreateResponse> {
  return apiPost<ApiCreateResponse>('/buildings', {
    ...input,
    geometry: cleanGeometry(input.geometry),
  })
}

export function updateBuilding(id: number, input: BuildingInput): Promise<ApiCreateResponse> {
  return apiPut<ApiCreateResponse>(`/buildings/${id}`, {
    ...input,
    geometry: cleanGeometry(input.geometry),
  })
}

export function deleteBuilding(id: number): Promise<boolean> {
  return apiDelete(`/buildings/${id}`)
}
