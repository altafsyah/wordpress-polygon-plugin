import { GeoJSON, Popup, useMap } from 'react-leaflet'
import type { GeoJsonObject } from 'geojson'
import type L from 'leaflet'
import type { Building, CategoryWithBuildings } from '../types'
import { mapConfig } from '../config'

interface Props {
  data: CategoryWithBuildings[]
  onDeleteBuilding: (id: number) => void
}

function normalizeGeometry(g: Building['geometry']): GeoJsonObject {
  if (typeof g === 'string') return JSON.parse(g) as GeoJsonObject
  return g as GeoJsonObject
}

export function BuildingsLayer({ data, onDeleteBuilding }: Props) {
  const map = useMap()

  return (
    <>
      {data.flatMap((category) =>
        category.buildings.map((b) => (
          <GeoJSON
            key={`${category.id}-${b.id}`}
            data={normalizeGeometry(b.geometry)}
            style={{
              color: category.color,
              weight: 2,
              fillOpacity: 0.3,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: (e) => {
                const layer = e.target as L.GeoJSON
                if ('getBounds' in layer) {
                  const bounds = (layer as L.GeoJSON).getBounds()
                  map.flyTo(bounds.getCenter(), mapConfig.flyZoom)
                }
              },
            }}
          >
            <Popup>
              <div className="flex flex-col items-center gap-2">
                <strong className="text-center">{b.name}</strong>
                <p className="text-sm text-gray-600">{category.name}</p>
                <button
                  type="button"
                  onClick={() => onDeleteBuilding(b.id)}
                  className="w-full rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                >
                  Delete Building
                </button>
              </div>
            </Popup>
          </GeoJSON>
        )),
      )}
    </>
  )
}
