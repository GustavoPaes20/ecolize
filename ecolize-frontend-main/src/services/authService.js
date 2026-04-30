import { delay } from '../utils/delay'
import {
  clearCurrentUserSession,
  getCurrentUser,
  mockStore,
  setCurrentUserSession,
} from '../mocks/mockStore'

function normalizeName(fullName) {
  return fullName.trim().split(/\s+/)[0] || fullName.trim()
}

export async function getSession() {
  await delay(150)

  const user = getCurrentUser()

  return user && mockStore.session
    ? {
        token: mockStore.session.token,
        user,
      }
    : null
}

export async function login({ email, password }) {
  await delay(350)

  const user = Object.values(mockStore.users).find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase()
  )

  if (!user || user.password !== password) {
    throw new Error('E-mail ou senha inválidos.')
  }

  setCurrentUserSession(user.id)

  return {
    token: mockStore.session.token,
    user: getCurrentUser(),
  }
}

export async function register({ name, email, password }) {
  await delay(350)

  const alreadyExists = Object.values(mockStore.users).some(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase()
  )

  if (alreadyExists) {
    throw new Error('Já existe uma conta com esse e-mail.')
  }

  const nextId = `user-${Object.keys(mockStore.users).length + 1}`

  mockStore.users[nextId] = {
    id: nextId,
    fullName: name.trim(),
    firstName: normalizeName(name),
    email: email.trim(),
    birthDate: '08/06/2004',
    gender: 'Feminino',
    countryState: 'Brasil, Amazonas',
    badgeTitle: 'Guardião da natureza',
    stats: [
      { value: '0', label: 'DIAS' },
      { value: '#-', label: 'RANK' },
      { value: '0', label: 'TROFÉUS' },
    ],
    password,
  }

  setCurrentUserSession(nextId)

  return {
    token: mockStore.session.token,
    user: getCurrentUser(),
  }
}

export async function logout() {
  await delay(120)
  clearCurrentUserSession()
}

export async function updateEmail(email) {
  await delay(250)

  const user = getCurrentUser()
  if (!user) {
    throw new Error('Sessão inválida.')
  }

  mockStore.users[user.id].email = email.trim()

  return getCurrentUser()
}

export async function updatePassword() {
  await delay(250)
  const user = getCurrentUser()

  if (!user) {
    throw new Error('Sessão inválida.')
  }

  return { success: true }
}
