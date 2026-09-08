import { defineStore } from 'pinia'
import api from '../services/api'

export const useClientSessionStore = defineStore('clientSession', {
  state: () => ({
    token: localStorage.getItem('siredo_client_token') || null,
    apiKey: localStorage.getItem('siredo_client_api_key') || null,
    client: JSON.parse(localStorage.getItem('siredo_client_data')) || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.client
  },

  actions: {
    async register(data) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/clients/register', data)
        const { token, api_key, client } = response.data.data
        this.setSession(token, api_key, client)
        return true
      } catch (err) {
        this.error = err.response?.data?.error || 'Terjadi kesalahan saat pendaftaran'
        return false
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/clients/login', { email, password })
        const { token, api_key, client } = response.data.data
        this.setSession(token, api_key, client)
        return true
      } catch (err) {
        this.error = err.response?.data?.error || 'Email atau password salah'
        return false
      } finally {
        this.loading = false
      }
    },

    async regenerateApiKey() {
      this.loading = true
      this.error = null
      try {
        // Must send token in Authorization header
        const response = await api.post('/clients/regenerate-key', {}, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        const newKey = response.data.data.api_key
        this.apiKey = newKey
        localStorage.setItem('siredo_client_api_key', newKey)
        return newKey
      } catch (err) {
        this.error = err.response?.data?.error || 'Gagal memperbarui API Key'
        return null
      } finally {
        this.loading = false
      }
    },

    setSession(token, apiKey, client) {
      this.token = token
      this.apiKey = apiKey
      this.client = client
      
      localStorage.setItem('siredo_client_token', token)
      localStorage.setItem('siredo_client_api_key', apiKey)
      localStorage.setItem('siredo_client_data', JSON.stringify(client))
    },

    logout() {
      this.token = null
      this.apiKey = null
      this.client = null
      
      localStorage.removeItem('siredo_client_token')
      localStorage.removeItem('siredo_client_api_key')
      localStorage.removeItem('siredo_client_data')
    }
  }
})

