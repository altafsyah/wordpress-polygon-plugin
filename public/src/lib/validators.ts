import { z } from 'zod'

export const COLOR_HEX_RE = /^#[0-9a-f]{6}$/i

export function safeColor(input: string, fallback = '#888888'): string {
  return COLOR_HEX_RE.test(input) ? input : fallback
}

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  color: z.string().regex(COLOR_HEX_RE, 'Color must be #rrggbb'),
})

export const buildingSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  category_id: z.string().regex(/^\d+$/, 'Pick a category'),
  geometry: z.string().min(1, 'Draw a polygon first'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
export type BuildingFormValues = z.infer<typeof buildingSchema>
