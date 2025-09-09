export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Return the response object for flexibility
      return response
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  async get(endpoint) {
    const response = await this.request(endpoint, { method: 'GET' })
    return response.json()
  }

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async delete(endpoint) {
    const response = await this.request(endpoint, { method: 'DELETE' })
    return response.ok
  }
}
