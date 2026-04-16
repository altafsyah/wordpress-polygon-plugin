import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from './Modal'
import { buildingSchema, type BuildingFormValues } from '../../lib/validators'
import type { Category } from '../../types'

interface Props {
  open: boolean
  geometry: string | null
  categories: Category[]
  onClose: () => void
  onSubmit: (values: BuildingFormValues) => void
  submitting: boolean
}

export function BuildingModal({
  open,
  geometry,
  categories,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { name: '', category_id: '', geometry: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ name: '', category_id: '', geometry: geometry ?? '' })
    }
  }, [open, geometry, reset])

  return (
    <Modal open={open} onClose={onClose} labelledBy="building-modal-title">
      <div className="absolute left-1/2 top-1/2 z-[999] h-fit w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-100 bg-white p-6 shadow">
        <h2 id="building-modal-title" className="mb-4 text-xl font-bold">
          Create New Building
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div className="flex flex-col space-y-2">
            <label htmlFor="building-name">Name</label>
            <input
              id="building-name"
              type="text"
              autoFocus
              className="rounded-md border border-gray-300 px-2 py-1"
              placeholder="e.g. Aria Warehouse"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="building-category">Category</label>
            <select
              id="building-category"
              className="rounded-md border border-gray-300 px-2 py-1"
              {...register('category_id')}
            >
              <option value="">-- Select category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2 md:col-span-2">
            <label htmlFor="building-geometry">Geometry</label>
            <textarea
              id="building-geometry"
              rows={5}
              readOnly
              className="rounded-md border border-gray-300 p-2 text-gray-500 disabled:bg-gray-100"
              placeholder="Draw a polygon on the map to generate geometry"
              {...register('geometry')}
            />
            {errors.geometry && (
              <p className="text-sm text-red-600">{errors.geometry.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-6 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md border border-gray-100 bg-black px-6 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Building'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
