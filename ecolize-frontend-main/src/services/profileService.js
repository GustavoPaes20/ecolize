import { delay } from '../utils/delay'
import { getCurrentUser, mockStore } from '../mocks/mockStore'

export async function getProfileOverview() {
  await delay(250)

  const user = getCurrentUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  return {
    user,
    stats: user.stats,
    history: mockStore.profileHistory,
  }
}

export async function getPersonalInfoItems() {
  await delay(180)

  const user = getCurrentUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  return [
    { label: 'Foto de perfil' },
    { label: 'Nome', value: user.fullName },
    { label: 'Data de nascimento', value: user.birthDate },
    { label: 'Gênero', value: user.gender },
    { label: 'País/estado', value: user.countryState },
  ]
}
