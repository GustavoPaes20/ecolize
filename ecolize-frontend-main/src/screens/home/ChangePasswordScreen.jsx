import { useState } from 'react'

import AccountSettingsFormScreen from '../../components/home/AccountSettingsFormScreen'
import { updatePassword } from '../../services/authService'

const lockIcon = require('../../../assets/images/auth/lock.png')

const fields = [
  {
    key: 'currentPassword',
    iconSource: lockIcon,
    placeholder: 'Senha atual',
    secureTextEntry: true,
  },
  {
    key: 'newPassword',
    iconSource: lockIcon,
    placeholder: 'Nova senha',
    secureTextEntry: true,
  },
  {
    key: 'confirmPassword',
    iconSource: lockIcon,
    placeholder: 'Confirmar nova senha',
    secureTextEntry: true,
  },
]

export default function ChangePasswordScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('neutral')

  async function handleSubmit(values) {
    if (!values.currentPassword || !values.newPassword || !values.confirmPassword) {
      setFeedbackTone('error')
      setFeedbackMessage('Preencha todos os campos de senha.')
      return
    }

    if (values.newPassword !== values.confirmPassword) {
      setFeedbackTone('error')
      setFeedbackMessage('A confirmação da nova senha não confere.')
      return
    }

    try {
      setSubmitting(true)
      setFeedbackMessage('')
      await updatePassword(values)
      setFeedbackTone('success')
      setFeedbackMessage('Senha atualizada com sucesso.')
    } catch (error) {
      setFeedbackTone('error')
      setFeedbackMessage(error.message || 'Não foi possível atualizar a senha.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountSettingsFormScreen
      navigation={navigation}
      title="Alterar senha"
      fields={fields}
      buttonText={submitting ? 'Salvando...' : 'Alterar senha'}
      onSubmit={handleSubmit}
      submitDisabled={submitting}
      feedbackMessage={feedbackMessage}
      feedbackTone={feedbackTone}
    />
  )
}
