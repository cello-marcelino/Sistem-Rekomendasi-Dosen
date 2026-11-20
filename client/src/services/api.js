import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request Interceptor: Attach credentials if available
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('siredo_admin_token')
    const dosenToken = localStorage.getItem('siredo_dosen_token')
    const token = adminToken || dosenToken

    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Default public client API key for recommendation queries
    const apiKey = localStorage.getItem('siredo_api_key') || 'srd_live_7c35f11cfc6d5e4ea72810eb8417132ae1d237f9d4e7852a'
    if (apiKey && !config.headers['X-API-Key']) {
      config.headers['X-API-Key'] = apiKey
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Standardized error envelope handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverError = error.response?.data?.error
    const customMessage =
      serverError?.message ||
      error.response?.data?.message ||
      error.message ||
      'Terjadi kendala pada komunikasi server'

    error.userMessage = customMessage
    error.errorCode = serverError?.code || 'NETWORK_ERROR'
    return Promise.reject(error)
  }
)

export const recommendationService = {
  async getSingleRecommendation(payload) {
    const response = await apiClient.post('/recommendations/single', {
      judul: payload.judul,
      abstrak: payload.abstrak,
      k_rank: payload.k_rank || 5,
      prodi: payload.prodi || undefined
    })
    return response.data
  }
}

export default apiClient
