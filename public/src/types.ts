import type { Feature, Geometry } from 'geojson'

export type GeoJSONInput = string | Feature | Geometry

export interface Category {
  id: number
  name: string
  color: string
}

export interface Building {
  id: number
  name: string
  category_id: number
  geometry: Feature | Geometry | string
}

export interface CategoryWithBuildings extends Category {
  buildings: Building[]
}

export interface BuildingInput {
  name: string
  category_id: number
  geometry: GeoJSONInput
}

export interface CategoryInput {
  name: string
  color: string
}

export interface ApiListResponse<T> {
  success: boolean
  data?: T[]
  message?: string
}

export interface ApiCreateResponse {
  success: boolean
  id?: number
  message?: string
}

declare global {
  interface Window {
    polygonPluginSettings?: {
      root: string
      nonce: string
    }
  }
}
