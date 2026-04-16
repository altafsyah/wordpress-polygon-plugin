import { Modal } from './Modal'

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  pending: boolean
}

export function DeleteCategoryModal({ open, onCancel, onConfirm, pending }: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      labelledBy="delete-category-title"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
    >
      <div>
        <h3 id="delete-category-title" className="mb-2 text-lg font-bold">
          Delete Category
        </h3>
        <p className="mb-4">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
