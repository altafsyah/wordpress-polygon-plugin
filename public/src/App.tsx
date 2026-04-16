import { useRef, useState } from 'react'
import type L from 'leaflet'
import { toast } from 'sonner'
import { MapView } from './components/Map'
import { DrawLayer } from './components/DrawLayer'
import { BuildingsLayer } from './components/BuildingsLayer'
import { Legend } from './components/Legend'
import { CategoryCard } from './components/CategoryCard'
import { BuildingModal } from './components/modals/BuildingModal'
import { CategoryModal } from './components/modals/CategoryModal'
import { DeleteCategoryModal } from './components/modals/DeleteCategoryModal'
import { useBuildings, useCreateBuilding, useDeleteBuilding } from './hooks/useBuildings'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from './hooks/useCategories'
import type { Category } from './types'
import type { BuildingFormValues, CategoryFormValues } from './lib/validators'

export default function App() {
  const mapRef = useRef<L.Map | null>(null)

  const buildingsQuery = useBuildings()
  const categoriesQuery = useCategories()

  const createBuilding = useCreateBuilding()
  const deleteBuilding = useDeleteBuilding()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [buildingModal, setBuildingModal] = useState<{
    open: boolean
    geometry: string | null
  }>({ open: false, geometry: null })
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean
    editing: Category | null
  }>({ open: false, editing: null })
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const buildings = buildingsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  const handleBuildingSubmit = (values: BuildingFormValues) => {
    createBuilding.mutate(
      {
        name: values.name,
        category_id: Number(values.category_id),
        geometry: values.geometry,
      },
      {
        onSuccess: () => {
          setBuildingModal({ open: false, geometry: null })
          toast.success('Building created')
        },
        onError: (e) => toast.error(`Create failed: ${(e as Error).message}`),
      },
    )
  }

  const handleDeleteBuilding = (id: number) => {
    deleteBuilding.mutate(id, {
      onSuccess: () => toast.success('Building deleted'),
      onError: (e) => toast.error(`Delete failed: ${(e as Error).message}`),
    })
  }

  const handleCategorySubmit = (values: CategoryFormValues) => {
    const editing = categoryModal.editing
    const onSuccess = () => {
      setCategoryModal({ open: false, editing: null })
      toast.success(editing ? 'Category updated' : 'Category created')
    }
    const onError = (e: unknown) =>
      toast.error(`Save failed: ${(e as Error).message}`)
    if (editing) {
      updateCategory.mutate({ id: editing.id, input: values }, { onSuccess, onError })
    } else {
      createCategory.mutate(values, { onSuccess, onError })
    }
  }

  const handleDeleteCategoryConfirm = () => {
    if (!deletingCategory) return
    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: () => {
        setDeletingCategory(null)
        toast.success('Category deleted')
      },
      onError: (e) => toast.error(`Delete failed: ${(e as Error).message}`),
    })
  }

  return (
    <>
      <header className="w-full bg-indigo-950 text-white">
        <nav className="mx-3 flex items-center justify-between gap-6">
          <ul className="flex items-center justify-center gap-6 py-4">
            <li>
              <button
                type="button"
                onClick={() => setCategoryModal({ open: true, editing: null })}
                className="cursor-pointer rounded-md px-3 py-2 transition-colors duration-200 hover:bg-indigo-500"
              >
                Create Category
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main className="relative flex-1 overflow-hidden bg-violet-300">
        <MapView mapRef={mapRef}>
          <DrawLayer
            onCreate={(geometry) => setBuildingModal({ open: true, geometry })}
          />
          <BuildingsLayer data={buildings} onDeleteBuilding={handleDeleteBuilding} />
        </MapView>
        <Legend data={buildings} mapRef={mapRef} />
        <CategoryCard
          categories={categories}
          onEdit={(c) => setCategoryModal({ open: true, editing: c })}
          onDelete={(c) => setDeletingCategory(c)}
        />
      </main>

      <BuildingModal
        open={buildingModal.open}
        geometry={buildingModal.geometry}
        categories={categories}
        onClose={() => setBuildingModal({ open: false, geometry: null })}
        onSubmit={handleBuildingSubmit}
        submitting={createBuilding.isPending}
      />
      <CategoryModal
        open={categoryModal.open}
        editing={categoryModal.editing}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSubmit={handleCategorySubmit}
        submitting={createCategory.isPending || updateCategory.isPending}
      />
      <DeleteCategoryModal
        open={deletingCategory !== null}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategoryConfirm}
        pending={deleteCategory.isPending}
      />
    </>
  )
}
