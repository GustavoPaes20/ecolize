import { useState } from 'react'

import AccountSettingsFormScreen from '../../components/home/AccountSettingsFormScreen'
import { useAuth } from '../../context/AuthContext'
import { updateEmail } from '../../services/authService'

const mailIcon = require('../../../assets/images/auth/mail.png')

export default function EmailSettingsScreen({ navigation }) {
  const { setUser, user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('neutral')

  async function handleSubmit(values) {
    if (!values.email?.trim()) {
      setFeedbackTone('error')
      setFeedbackMessage('Digite um e-mail válido.')
      return
    }

    try {
      setSubmitting(true)
      setFeedbackMessage('')
      const updatedUser = await updateEmail(values.email)
      setUser(updatedUser)
      setFeedbackTone('success')
      setFeedbackMessage('E-mail atualizado com sucesso.')
    } catch (error) {
      setFeedbackTone('error')
      setFeedbackMessage(error.message || 'Não foi possível atualizar o e-mail.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountSettingsFormScreen
      navigation={navigation}
      title="E-mail"
      fields={[
        {
          key: 'email',
          iconSource: mailIcon,
          placeholder: 'Insira seu novo E-mail',
          initialValue: user?.email || '',
        },
      ]}
      buttonText={submitting ? 'Salvando...' : 'Alterar email'}
      onSubmit={handleSubmit}
      submitDisabled={submitting}
      feedbackMessage={feedbackMessage}
      feedbackTone={feedbackTone}
    />
  )
}
