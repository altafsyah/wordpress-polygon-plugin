import { useState } from 'react'
import L from 'leaflet'
import type { GeoJsonObject } from 'geojson'
import type { Building, CategoryWithBuildings } from '../types'
import { mapConfig } from '../config'
import { safeColor } from '../lib/validators'

interface Props {
  data: CategoryWithBuildings[]
  mapRef: React.RefObject<L.Map | null>
}

function flyToBuilding(map: L.Map, building: Building) {
  const geom: GeoJsonObject =
    typeof building.geometry === 'string'
      ? (JSON.parse(building.geometry) as GeoJsonObject)
      : (building.geometry as GeoJsonObject)
  const bounds = L.geoJSON(geom).getBounds()
  if (bounds.isValid()) {
    map.flyTo(bounds.getCenter(), mapConfig.flyZoom)
  }
}

export function Legend({ data, mapRef }: Props) {
  if (data.length === 0) {
    return (
      <div className="absolute right-3 top-3 z-[999] min-w-[200px] rounded-md border border-gray-100 bg-white px-3 py-1 shadow">
        <p className="text-sm text-gray-500">No categories available</p>
      </div>
    )
  }

  return (
    <div className="absolute right-3 top-3 z-[999] max-h-[500px] min-w-[200px] overflow-y-auto rounded-md border border-gray-100 bg-white px-3 py-1 shadow">
      {data.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          onPick={(b) => mapRef.current && flyToBuilding(mapRef.current, b)}
        />
      ))}
    </div>
  )
}

function CategorySection({
  category,
  onPick,
}: {
  category: CategoryWithBuildings
  onPick: (b: Building) => void
}) {
  const [open, setOpen] = useState(false)
  if (category.buildings.length === 0) return null
  const color = safeColor(category.color)
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded px-1 py-1 text-left font-bold hover:bg-gray-50"
      >
        <span
          className="transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        <span
          className="inline-block h-3 w-3 rounded-full border border-gray-300"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span>
          {category.name} ({category.buildings.length})
        </span>
      </button>
      {open && (
        <ul className="ml-6 mt-1">
          {category.buildings.map((b) => (
            <li
              key={b.id}
              className="mb-1 flex cursor-pointer items-center gap-2 text-sm text-gray-700"
              onClick={() => onPick(b)}
            >
              <span
                className="inline-block h-2 w-2 rounded-full border border-gray-300"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span>{b.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
