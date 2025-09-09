import { ApiService } from '../services'

export class Category {
  constructor(baseUrl) {
    this.api = new ApiService(baseUrl)
    this.onCategoryChange = null
  }

  async getAll() {
    try {
      const response = await this.api.get('/categories')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  }

  async create(categoryData) {
    try {
      const response = await this.api.post('/categories', categoryData)
      this.notifyChange()
      return response
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  }

  async update(id, categoryData) {
    try {
      const response = await this.api.put(`/categories/${id}`, categoryData)
      this.notifyChange()
      return response
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      const success = await this.api.delete(`/categories/${id}`)
      if (success) {
        this.notifyChange()
      }
      return success
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  }

  notifyChange() {
    if (this.onCategoryChange) {
      this.onCategoryChange()
    }
  }
}
