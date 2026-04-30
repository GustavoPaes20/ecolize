import { useState } from 'react'

import AuthInput from '../../components/auth/AuthInput'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../context/AuthContext'

const lockIconImage = require('../../../assets/images/auth/lock.png')
const mailIconImage = require('../../../assets/images/auth/mail.png')

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('neutral')

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setFeedbackTone('error')
      setFeedbackMessage('Preencha e-mail e senha para continuar.')
      return
    }

    try {
      setSubmitting(true)
      setFeedbackMessage('')
      await login({ email, password })
    } catch (error) {
      setFeedbackTone('error')
      setFeedbackMessage(error.message || 'Não foi possível entrar agora.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      navigation={navigation}
      verticalOffset={-18}
      title={`Entre na\nsua conta`}
      subtitle="Acesse a Ecolize e acompanhe seus gastos com praticidade."
      buttonText={submitting ? 'Entrando...' : 'Entrar'}
      onSubmit={handleSubmit}
      submitDisabled={submitting}
      feedbackMessage={feedbackMessage}
      feedbackTone={feedbackTone}
      footerText="Ainda não tem uma conta?"
      footerLinkText="Criar conta"
      onFooterPress={() => navigation.navigate('Register')}
    >
      <AuthInput
        iconSource={mailIconImage}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
      />
      <AuthInput
        iconSource={lockIconImage}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
    </AuthLayout>
  )
}
