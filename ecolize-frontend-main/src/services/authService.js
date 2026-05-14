import AsyncStorage from '@react-native-async-storage/async-storage'
import { request } from './apiClient'

const TOKEN_KEY = '@ecolize:token'
const USER_KEY = '@ecolize:user'

function normalizeName(fullName) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim()
}

// Monta o objeto de usuário no formato que o app espera
function buildUserFromBackend(backendUser) {
  return {
    id: backendUser.id,
    fullName: backendUser.name,
    firstName: normalizeName(backendUser.name),
    email: backendUser.email,
    birthDate: backendUser.data_nascimento || '',
    gender: backendUser.genero || '',
    countryState: [backendUser.pais, backendUser.estado].filter(Boolean).join(', '),
    badgeTitle: 'Guardião da natureza',
    stats: [
      { value: '0', label: 'DIAS' },
      { value: '#-', label: 'RANK' },
      { value: '0', label: 'TROFÉUS' },
    ],
  }
}

export async function getSession() {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  const userRaw = await AsyncStorage.getItem(USER_KEY)

  if (!token || !userRaw) return null

  return {
    token,
    user: JSON.parse(userRaw),
  }
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  })
  // backend retorna: { token, user: { id, name, email } }

  const user = buildUserFromBackend(data.user)

  await AsyncStorage.setItem(TOKEN_KEY, data.token)
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))

  return { token: data.token, user }
}

export async function register({ name, email, password, data_nascimento, genero, cidade, estado, pais }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      password,
      data_nascimento, // AAAA-MM-DD (convertido a partir de DD-MM-AAAA na tela de registro)
      genero,
      cidade,
      estado,
      pais,
    }),
  })

  const user = buildUserFromBackend(data.user)

  await AsyncStorage.setItem(TOKEN_KEY, data.token)
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))

  return { token: data.token, user }
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY)
  await AsyncStorage.removeItem(USER_KEY)
}

export async function updateEmail(email) {
  // Seu backend não tem rota específica pra trocar só o email;
  // o PUT /users/profile aceita nome, cidade, etc. mas não email.
  // Por ora, atualiza só localmente. Se quiser persistir, precisa criar rota no backend.
  const userRaw = await AsyncStorage.getItem(USER_KEY)
  if (!userRaw) throw new Error('Sessão inválida.')

  const user = JSON.parse(userRaw)
  user.email = email.trim()
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))

  return user
}

export async function updatePassword({ currentPassword, newPassword }) {
  await request('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
  return { success: true }
}