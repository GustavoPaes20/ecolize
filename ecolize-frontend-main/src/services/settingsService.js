import { delay } from '../utils/delay'
import { getCurrentUser, mockStore } from '../mocks/mockStore'

export async function getSettingsData() {
  await delay(180)

  const user = getCurrentUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  return {
    user,
    accountItems: [
      { label: 'Informações pessoais', type: 'internal', routeName: 'PersonalInfo' },
      { label: 'E-mail', value: user.email, type: 'internal', routeName: 'EmailSettings' },
      { label: 'Senha', value: 'Mudar senha', type: 'internal', routeName: 'ChangePassword' },
      { label: 'Notificações', type: 'internal' },
    ],
    supportItems: mockStore.settingsSupport,
  }
}
