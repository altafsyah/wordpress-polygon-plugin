export class Map {
  constructor(containerId, config) {
    this.containerId = containerId
    this.config = config
    this.map = null
    this.buildingsLayerGroup = null
    this.drawControl = null
    this.onDrawCreated = null // Callback for when a shape is drawn
  }

  async init() {
    try {
      // Initialize the map
      this.map = L.map(this.containerId).setView(
        this.config.center,
        this.config.zoom
      )

      // Add tile layer
      L.tileLayer(
        this.config.tileLayer.url,
        this.config.tileLayer.options
      ).addTo(this.map)

      // Initialize buildings layer group
      this.buildingsLayerGroup = L.layerGroup().addTo(this.map)

      // Setup drawing controls
      this.setupDrawingControls()

      console.log('Map initialized successfully')
    } catch (error) {
      console.error('Failed to initialize map:', error)
      throw error
    }
  }

  setupDrawingControls() {
    this.drawControl = new L.Control.Draw({
      draw: {
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: true,
        polyline: false,
        rectangle: false,
      },
    })

    this.map.addControl(this.drawControl)

    // Listen for draw events
    this.map.on('draw:created', (e) => {
      const layer = e.layer
      if (layer && this.onDrawCreated) {
        const geoJson = layer.toGeoJSON()
        const geometryString = JSON.stringify(geoJson, null, 2)
        this.onDrawCreated(geometryString)
      }
    })
  }

  renderBuildings(buildingsData) {
    // Clear existing buildings
    this.buildingsLayerGroup.clearLayers()

    if (!buildingsData || buildingsData.length === 0) {
      return
    }

    buildingsData.forEach((category) => {
      if (!category?.buildings?.length) return

      category.buildings.forEach((building) => {
        this.addBuildingToMap(building, category)
      })
    })
  }

  addBuildingToMap(building, category) {
    try {
      const geoJsonFeature = building.geometry

      const popupContent = `
                <div class="min-w-fit flex flex-col gap-2 items-center">
                    <strong class="text-center">${building.name}</strong>
                    <p class="text-sm text-gray-600">${category.name}</p>
                    <button 
                        onclick="deleteBuilding(${building.id})"
                        class="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Delete Building
                    </button>
                </div>
            `

      const layer = L.geoJSON(geoJsonFeature, {
        style: {
          color: category.color,
          weight: 2,
          fillOpacity: 0.3,
          opacity: 0.8,
        },
      })

      layer.bindPopup(popupContent)
      layer.on('click', (e) => {
        const popup = e.target.getPopup()
        popup.openOn(this.map)
        // Pan to the building's center
        const bounds = e.target.getBounds()
        const center = bounds.getCenter()
        this.map.flyTo(center, 18)
      })

      layer.buildingId = building.id
      layer.addTo(this.buildingsLayerGroup)
    } catch (error) {
      console.error('Failed to add building to map:', building, error)
    }
  }

  renderLegend(buildingsData) {
    const legendContainer = document.getElementById('map-legend')
    if (!legendContainer) return

    legendContainer.innerHTML = ''

    if (!buildingsData || buildingsData.length === 0) {
      legendContainer.innerHTML =
        '<p class="text-gray-500 text-sm">No categories available</p>'
      return
    }

    buildingsData.forEach((category) => {
      if (!category?.buildings?.length) return

      const categoryDiv = this.createCategoryLegend(category)
      legendContainer.appendChild(categoryDiv)
    })
  }

  createCategoryLegend(category) {
    const categoryDiv = document.createElement('div')
    categoryDiv.className = 'map-legend-category mb-2'

    // Create collapsible header
    const categoryHeader = document.createElement('button')
    categoryHeader.className =
      'map-legend-title flex items-center gap-2 w-full text-left font-bold py-1 hover:bg-gray-50 rounded px-1'
    categoryHeader.innerHTML = `
            <span class="legend-arrow transition-transform">▶</span>
            <span style="
                width:12px;
                height:12px;
                border-radius:50%;
                background:${category.color};
                display:inline-block;
                border:1px solid #ccc;
            "></span>
            <span>${category.name} (${category.buildings.length})</span>
        `

    // Create category list (initially hidden)
    const categoryList = document.createElement('ul')
    categoryList.className = 'map-legend-list ml-6 mt-1'
    categoryList.style.display = 'none'

    category.buildings.forEach((building) => {
      const legendItem = document.createElement('li')
      legendItem.className =
        'flex items-center gap-2 mb-1 text-sm text-gray-700'
      legendItem.innerHTML = `
    <span style="
      width:8px;
      height:8px;
      border-radius:50%;
      background:${category.color};
      display:inline-block;
      border:1px solid #ccc;
    "></span>
    <span>${building.name}</span>
  `
      // Pan to building on legend click
      legendItem.style.cursor = 'pointer'
      legendItem.addEventListener('click', () => {
        // Find the layer by buildingId
        const layer = this.buildingsLayerGroup
          .getLayers()
          .find((l) => l.buildingId === building.id)
        if (layer && layer.getBounds) {
          const bounds = layer.getBounds()
          const center = bounds.getCenter() // Get the center of the building
          this.map.flyTo(center, 18) // Pan and zoom to the center
          layer.openPopup()
        }
      })

      categoryList.appendChild(legendItem)
    })

    // Toggle functionality
    categoryHeader.addEventListener('click', () => {
      const arrow = categoryHeader.querySelector('.legend-arrow')
      const isHidden = categoryList.style.display === 'none'

      if (isHidden) {
        categoryList.style.display = 'block'
        arrow.style.transform = 'rotate(90deg)'
      } else {
        categoryList.style.display = 'none'
        arrow.style.transform = 'rotate(0deg)'
      }
    })

    categoryDiv.appendChild(categoryHeader)
    categoryDiv.appendChild(categoryList)

    return categoryDiv
  }

  // Utility method to get map bounds
  getBounds() {
    return this.map.getBounds()
  }

  // Utility method to fit map to buildings
  fitToBuildingsExtent() {
    if (this.buildingsLayerGroup.getLayers().length > 0) {
      const group = new L.featureGroup(this.buildingsLayerGroup.getLayers())
      this.map.fitBounds(group.getBounds().pad(0.1))
    }
  }
}
