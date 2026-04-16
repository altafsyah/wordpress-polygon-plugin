import type { Category } from '../types'
import { safeColor } from '../lib/validators'

interface Props {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ categories, onEdit, onDelete }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[1000] min-w-[260px] max-w-[320px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <h3 className="mb-3 font-bold">Categories</h3>
      {categories.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-gray-300"
                  style={{ background: safeColor(c.color) }}
                  aria-hidden="true"
                />
                <span>{c.name}</span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
