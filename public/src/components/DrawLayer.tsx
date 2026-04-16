import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-draw'
import type { Feature } from 'geojson'

interface Props {
  onCreate: (geometry: string) => void
}

export function DrawLayer({ onCreate }: Props) {
  const map = useMap()

  useEffect(() => {
    const drawControl = new L.Control.Draw({
      draw: {
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: {},
        polyline: false,
        rectangle: false,
      },
    })
    map.addControl(drawControl)

    const handler = (event: L.LeafletEvent) => {
      const layer = (event as unknown as { layer: L.Layer }).layer
      if (layer && 'toGeoJSON' in layer) {
        const geoJson = (layer as L.Layer & { toGeoJSON: () => Feature }).toGeoJSON()
        onCreate(JSON.stringify(geoJson, null, 2))
      }
    }
    map.on('draw:created', handler)

    return () => {
      map.off('draw:created', handler)
      map.removeControl(drawControl)
    }
  }, [map, onCreate])

  return null
}
