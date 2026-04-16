import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from './Modal'
import { categorySchema, type CategoryFormValues } from '../../lib/validators'
import type { Category } from '../../types'

interface Props {
  open: boolean
  editing: Category | null
  onClose: () => void
  onSubmit: (values: CategoryFormValues) => void
  submitting: boolean
}

export function CategoryModal({
  open,
  editing,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', color: '#3388ff' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? '',
        color: editing?.color ?? '#3388ff',
      })
    }
  }, [open, editing, reset])

  return (
    <Modal open={open} onClose={onClose} labelledBy="category-modal-title">
      <div className="absolute left-1/2 top-1/2 z-[999] h-fit w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-100 bg-white p-6 shadow">
        <h2 id="category-modal-title" className="mb-4 text-xl font-bold">
          {editing ? 'Edit Category' : 'Create Category'}
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div className="flex flex-col space-y-2">
            <label htmlFor="category-name">Name</label>
            <input
              id="category-name"
              type="text"
              autoFocus
              className="rounded-md border border-gray-300 px-2 py-1"
              placeholder="e.g. Warehouses"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="category-color">Label Color</label>
            <input
              id="category-color"
              type="color"
              className="h-10 w-full rounded-md border border-gray-300"
              {...register('color')}
            />
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
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
              {submitting ? 'Saving…' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
