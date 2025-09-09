import { ApiService } from '../services'

export class Building {
  constructor(baseUrl) {
    this.api = new ApiService(baseUrl)
    this.onBuildingChange = null // Callback for when buildings change
  }

  async getAll() {
    try {
      const response = await this.api.get('/buildings')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch buildings:', error)
      return []
    }
  }

  async create(buildingData) {
    try {
      // Clean geometry data
      const cleanedGeometry = this.cleanGeometry(buildingData.geometry)

      const processedData = {
        ...buildingData,
        geometry: cleanedGeometry,
      }

      const response = await this.api.post('/buildings', processedData)
      this.notifyChange()
      return response
    } catch (error) {
      console.error('Failed to create building:', error)
      throw error
    }
  }

  async update(id, buildingData) {
    try {
      const cleanedGeometry = this.cleanGeometry(buildingData.geometry)

      const processedData = {
        ...buildingData,
        geometry: cleanedGeometry,
      }

      const response = await this.api.put(`/buildings/${id}`, processedData)
      this.notifyChange()
      return response
    } catch (error) {
      console.error('Failed to update building:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      const success = await this.api.delete(`/buildings/${id}`)
      if (success) {
        this.notifyChange()
      }
      return success
    } catch (error) {
      console.error('Failed to delete building:', error)
      throw error
    }
  }

  cleanGeometry(geometry) {
    if (typeof geometry === 'string') {
      // Remove leading/trailing quotes and unescape quotes
      return geometry.replace(/^"|"$/g, '').replace(/\\"/g, '"')
    }
    return geometry
  }

  notifyChange() {
    if (this.onBuildingChange) {
      this.onBuildingChange()
    }
  }
}
