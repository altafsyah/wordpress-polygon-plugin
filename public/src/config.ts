import type { LatLngExpression } from 'leaflet'

export const mapConfig = {
  center: [51.456765, 0.264846] as LatLngExpression,
  zoom: 15,
  flyZoom: 18,
  tileLayer: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS',
    maxZoom: 19,
  },
}

export const uiConfig = {
  toast: {
    duration: 3000,
  },
}
