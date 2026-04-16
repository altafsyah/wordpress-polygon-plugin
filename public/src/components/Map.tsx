import type { ReactNode, Ref } from 'react'
import type L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import { mapConfig } from '../config'

interface Props {
  mapRef?: Ref<L.Map>
  children?: ReactNode
}

export function MapView({ mapRef, children }: Props) {
  return (
    <MapContainer
      ref={mapRef}
      center={mapConfig.center}
      zoom={mapConfig.zoom}
      className="h-full w-full"
    >
      <TileLayer
        url={mapConfig.tileLayer.url}
        attribution={mapConfig.tileLayer.attribution}
        maxZoom={mapConfig.tileLayer.maxZoom}
      />
      {children}
    </MapContainer>
  )
}
