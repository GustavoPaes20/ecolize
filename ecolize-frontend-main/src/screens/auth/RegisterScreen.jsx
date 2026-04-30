import { useState } from 'react'

import AuthInput from '../../components/auth/AuthInput'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../context/AuthContext'

const lockIconImage = require('../../../assets/images/auth/lock.png')
const mailIconImage = require('../../../assets/images/auth/mail.png')
const personIconImage = require('../../../assets/images/auth/person.png')

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('neutral')

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password) {
      setFeedbackTone('error')
      setFeedbackMessage('Preencha nome, e-mail e senha para continuar.')
      return
    }

    try {
      setSubmitting(true)
      setFeedbackMessage('')
      await register({ name, email, password })
    } catch (error) {
      setFeedbackTone('error')
      setFeedbackMessage(error.message || 'Não foi possível criar a conta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      navigation={navigation}
      verticalOffset={-18}
      title={`Crie sua\nconta`}
      subtitle="Comece a economizar de forma inteligente com a Ecolize."
      buttonText={submitting ? 'Criando...' : 'Criar conta'}
      onSubmit={handleSubmit}
      submitDisabled={submitting}
      feedbackMessage={feedbackMessage}
      feedbackTone={feedbackTone}
      footerText="Já tem uma conta?"
      footerLinkText="Entre aqui"
      onFooterPress={() => navigation.navigate('Login')}
    >
      <AuthInput
        iconSource={personIconImage}
        placeholder="Nome completo"
        value={name}
        onChangeText={setName}
      />
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
