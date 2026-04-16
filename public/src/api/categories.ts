import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type {
  ApiCreateResponse,
  ApiListResponse,
  Category,
  CategoryInput,
} from '../types'

export async function listCategories(): Promise<Category[]> {
  const res = await apiGet<ApiListResponse<Category>>('/categories')
  return res.data ?? []
}

export function createCategory(input: CategoryInput): Promise<ApiCreateResponse> {
  return apiPost<ApiCreateResponse>('/categories', input)
}

export function updateCategory(id: number, input: CategoryInput): Promise<ApiCreateResponse> {
  return apiPut<ApiCreateResponse>(`/categories/${id}`, input)
}

export function deleteCategory(id: number): Promise<boolean> {
  return apiDelete(`/categories/${id}`)
}
