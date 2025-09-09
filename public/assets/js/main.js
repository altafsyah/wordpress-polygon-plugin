// Main application entry point
import { Map } from './modules/map'
import { Building } from './modules/building'
import { Category } from './modules/building-category'
import { UI } from './modules/ui'
import { config } from './config'

class MapApplication {
  constructor() {
    this.map = null
    this.category = null
    this.building = null
    this.ui = null
  }

  async init() {
    try {
      this.map = new Map('map', config.map)
      this.category = new Category(config.api.baseUrl)
      this.building = new Building(config.api.baseUrl)
      this.ui = new UI()

      // Set up cross- dependencies
      this.setupDependencies()

      // Initialize UI event listeners
      this.setupEventListeners()

      // Initialize map
      await this.map.init()

      // Load initial data
      await this.loadInitialData()

      console.log('Map application initialized successfully')
    } catch (error) {
      console.error('Failed to initialize map application:', error)
      this.ui.showToast('Failed to initialize application', 'error')
    }
  }

  setupDependencies() {
    // Allow s to communicate with each other
    this.category.onCategoryChange = () => this.handleDataChange()
    this.building.onBuildingChange = () => this.handleDataChange()

    // Set up map draw events
    this.map.onDrawCreated = (geometry) => {
      this.ui.showBuildingModal(geometry)
    }
  }

  setupEventListeners() {
    // Category management
    document
      .getElementById('btn-create-category')
      .addEventListener('click', () => this.ui.showCategoryModal())

    document
      .getElementById('btn-cancel-category')
      .addEventListener('click', () => this.ui.hideCategoryModal())

    document
      .getElementById('form-category')
      .addEventListener('submit', (e) => this.handleCategorySubmit(e))

    // Building management
    document
      .getElementById('btn-cancel-building')
      .addEventListener('click', () => this.ui.hideBuildingModal())

    document
      .getElementById('form-new-building')
      .addEventListener('submit', (e) => this.handleBuildingSubmit(e))

    // Category deletion
    document
      .getElementById('btn-cancel-delete')
      .addEventListener('click', () => this.ui.hideDeleteModal())

    document
      .getElementById('btn-confirm-delete')
      .addEventListener('click', () => this.handleCategoryDelete())

    // Dynamic category management (edit/delete buttons)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-category')) {
        this.handleCategoryEdit(e.target.dataset.id)
      } else if (e.target.classList.contains('delete-category')) {
        this.ui.showDeleteModal(e.target.dataset.id)
      }
    })
  }

  async loadInitialData() {
    try {
      // Load categories and populate dropdowns
      const categories = await this.category.getAll()
      this.ui.populateCategoryDropdown(categories)
      this.ui.renderCategoryCard(categories)

      // Load and render buildings
      const buildings = await this.building.getAll()
      this.map.renderBuildings(buildings)
      this.map.renderLegend(buildings)
    } catch (error) {
      console.error('Failed to load initial data:', error)
      this.ui.showToast('Failed to load data', 'error')
    }
  }

  async handleDataChange() {
    // Refresh all data when categories or buildings change
    await this.loadInitialData()
  }

  async handleCategorySubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const categoryData = {
      name: formData.get('name'),
      color: formData.get('color'),
    }

    try {
      const isEdit = this.ui.isEditingCategory()

      if (isEdit) {
        await this.category.update(this.ui.getEditingCategoryId(), categoryData)
        this.ui.showToast('Category updated successfully', 'success')
      } else {
        await this.category.create(categoryData)
        this.ui.showToast('Category created successfully', 'success')
      }

      this.ui.hideCategoryModal()
      await this.handleDataChange()
    } catch (error) {
      console.error('Failed to save category:', error)
      this.ui.showToast('Failed to save category', 'error')
    }
  }

  async handleBuildingSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const buildingData = {
      name: formData.get('name'),
      category_id: parseInt(formData.get('category')),
      geometry: formData.get('geometry'),
    }

    console.log(formData.get('geometry'))
    console.log(buildingData)

    try {
      await this.building.create(buildingData)
      this.ui.showToast('Building created successfully', 'success')
      this.ui.hideBuildingModal()
      await this.handleDataChange()
    } catch (error) {
      console.error('Failed to create building:', error)
      this.ui.showToast('Failed to create building', 'error')
    }
  }

  async handleCategoryEdit(categoryId) {
    try {
      const categories = await this.category.getAll()
      const category = categories.find((cat) => cat.id == categoryId)

      if (category) {
        this.ui.showCategoryModal(category)
      }
    } catch (error) {
      console.error('Failed to load category for editing:', error)
      this.ui.showToast('Failed to load category', 'error')
    }
  }

  async handleCategoryDelete() {
    try {
      const categoryId = this.ui.getDeletingCategoryId()
      await this.category.delete(categoryId)
      this.ui.showToast('Category deleted successfully', 'success')
      this.ui.hideDeleteModal()
      await this.handleDataChange()
    } catch (error) {
      console.error('Failed to delete category:', error)
      this.ui.showToast('Failed to delete category', 'error')
    }
  }

  // Global method for building deletion (called from map popups)
  async deleteBuilding(buildingId) {
    try {
      await this.building.delete(buildingId)
      this.ui.showToast('Building deleted successfully', 'success')
      await this.handleDataChange()
    } catch (error) {
      console.error('Failed to delete building:', error)
      this.ui.showToast('Failed to delete building', 'error')
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new MapApplication()
  await app.init()

  // Make deleteBuilding globally accessible for popup buttons
  window.deleteBuilding = (buildingId) => app.deleteBuilding(buildingId)
})
