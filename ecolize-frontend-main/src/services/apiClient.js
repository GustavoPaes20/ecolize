import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config/env'

const TOKEN_KEY = '@ecolize:token'

export class ApiError extends Error {
  constructor(message, status = 500, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function request(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.message || 'Erro ao comunicar com a API.', response.status, data)
  }

  return data
}