// Application configuration
export const config = {
  api: {
    baseUrl: 'http://localhost/api-map',
  },
  map: {
    center: [51.456765, 0.264846],
    zoom: 15,
    tileLayer: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS',
        maxZoom: 19,
      },
    },
  },
  ui: {
    toast: {
      duration: 3000,
      position: {
        top: '32px',
        right: '32px',
      },
    },
  },
}
