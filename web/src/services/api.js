import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('siredo_admin_token') || localStorage.getItem('siredo_client_token')
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    const apiKey = localStorage.getItem('siredo_admin_key') || localStorage.getItem('siredo_client_api_key') || import.meta.env.VITE_SIREDO_API_KEY
    if (apiKey && !config.headers['X-API-Key']) {
      config.headers['X-API-Key'] = apiKey
    }
    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Extract standardized error message conforming to backend ResponseFormatter
    const serverError = error.response?.data?.error
    const customMessage = serverError?.message || error.response?.data?.message || error.message || 'Terjadi kesalahan pada koneksi server'
    
    // Attach clean error message to error object
    error.userMessage = customMessage
    error.errorCode = serverError?.code || 'NETWORK_ERROR'
    
    return Promise.reject(error)
  }
)

export default api
