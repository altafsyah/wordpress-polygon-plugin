export class UI {
  constructor() {
    this.editingCategoryId = null
    this.deletingCategoryId = null
    this.modals = {
      building: document.getElementById('modal-new-building'),
      category: document.getElementById('modal-category'),
      deleteCategory: document.getElementById('modal-delete-category'),
    }
    this.forms = {
      building: document.getElementById('form-new-building'),
      category: document.getElementById('form-category'),
    }
  }

  // Toast notifications
  showToast(message, type = 'success', duration = 3000) {
    // Remove any existing toast
    const existingToast = document.getElementById('custom-toast')
    if (existingToast) existingToast.remove()

    const toast = document.createElement('div')
    toast.id = 'custom-toast'
    toast.textContent = message

    // Apply styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '32px',
      right: '32px',
      zIndex: '9999',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      background: type === 'success' ? '#22c55e' : '#ef4444',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out',
      maxWidth: '300px',
      wordWrap: 'break-word',
    })

    document.body.appendChild(toast)

    // Fade in
    setTimeout(() => (toast.style.opacity = '1'), 10)

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  // Building Modal Management
  showBuildingModal(geometry = '') {
    const geometryField = document.getElementById('building-geometry')
    if (geometryField) {
      geometryField.value = geometry
    }

    this.forms.building.reset()
    if (geometry) {
      geometryField.value = geometry
    }

    this.modals.building.showModal()
  }

  hideBuildingModal() {
    this.modals.building.close()
    this.forms.building.reset()
  }

  // Category Modal Management
  showCategoryModal(category = null) {
    const title = document.getElementById('category-modal-title')
    const nameField = document.getElementById('category-name')
    const colorField = document.getElementById('category-color')

    if (category) {
      // Edit mode
      title.textContent = 'Edit Category'
      nameField.value = category.name
      colorField.value = category.color
      this.editingCategoryId = category.id
    } else {
      // Create mode
      title.textContent = 'Create Category'
      this.forms.category.reset()
      this.editingCategoryId = null
    }

    this.modals.category.showModal()
  }

  hideCategoryModal() {
    this.modals.category.close()
    this.forms.category.reset()
    this.editingCategoryId = null
  }

  isEditingCategory() {
    return this.editingCategoryId !== null
  }

  getEditingCategoryId() {
    return this.editingCategoryId
  }

  // Delete Modal Management
  showDeleteModal(categoryId) {
    this.deletingCategoryId = categoryId
    this.modals.deleteCategory.showModal()
  }

  hideDeleteModal() {
    this.modals.deleteCategory.close()
    this.deletingCategoryId = null
  }

  getDeletingCategoryId() {
    return this.deletingCategoryId
  }

  // Category Dropdown Population
  populateCategoryDropdown(categories) {
    const select = document.getElementById('building-category')
    if (!select) return

    select.innerHTML = ''

    if (categories.length === 0) {
      const option = document.createElement('option')
      option.value = ''
      option.textContent = 'No categories available'
      option.disabled = true
      select.appendChild(option)
      return
    }

    categories.forEach((category) => {
      const option = document.createElement('option')
      option.value = category.id
      option.textContent = category.name
      select.appendChild(option)
    })
  }

  // Category Card Rendering
  renderCategoryCard(categories) {
    const categoryList = document.getElementById('category-list')
    if (!categoryList) return

    categoryList.innerHTML = ''

    if (categories.length === 0) {
      categoryList.innerHTML =
        '<li class="text-gray-500 text-sm">No categories available</li>'
      return
    }

    categories.forEach((category) => {
      const li = document.createElement('li')
      li.className =
        'flex items-center justify-between gap-2 p-2 rounded hover:bg-gray-50 transition-colors'

      li.innerHTML = `
                <div class="flex items-center gap-2">
                    <span style="
                        width:16px;
                        height:16px;
                        border-radius:50%;
                        background:${category.color};
                        display:inline-block;
                        border:1px solid #ccc;
                        flex-shrink: 0;
                    "></span>
                    <span class="truncate">${category.name}</span>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                    <button 
                        class="edit-category px-2 py-1 rounded bg-indigo-500 text-white text-xs hover:bg-indigo-600 transition-colors" 
                        data-id="${category.id}"
                        title="Edit category"
                    >
                        Edit
                    </button>
                    <button 
                        class="delete-category px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 transition-colors" 
                        data-id="${category.id}"
                        title="Delete category"
                    >
                        Delete
                    </button>
                </div>
            `

      categoryList.appendChild(li)
    })
  }

  // Form validation helpers
  validateBuildingForm() {
    const name = document.getElementById('building-name').value.trim()
    const category = document.getElementById('building-category').value
    const geometry = document.getElementById('building-geometry').value.trim()

    const errors = []

    if (!name) errors.push('Building name is required')
    if (!category) errors.push('Category is required')
    if (!geometry) errors.push('Geometry is required (draw a shape on the map)')

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  validateCategoryForm() {
    const name = document.getElementById('category-name').value.trim()
    const color = document.getElementById('category-color').value

    const errors = []

    if (!name) errors.push('Category name is required')
    if (!color) errors.push('Color is required')

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Utility methods
  showLoading(element) {
    if (element) {
      element.disabled = true
      element.textContent = 'Loading...'
    }
  }

  hideLoading(element, originalText) {
    if (element) {
      element.disabled = false
      element.textContent = originalText
    }
  }

  // Keyboard event handlers
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape key closes modals
      if (e.key === 'Escape') {
        if (this.modals.building.open) this.hideBuildingModal()
        if (this.modals.category.open) this.hideCategoryModal()
        if (this.modals.deleteCategory.open) this.hideDeleteModal()
      }
    })
  }
}
