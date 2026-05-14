import { useState } from 'react'

import AuthInput from '../../components/auth/AuthInput'
import AuthLayout from '../../components/auth/AuthLayout'
import { useAuth } from '../../context/AuthContext'

const lockIconImage = require('../../../assets/images/auth/lock.png')
const mailIconImage = require('../../../assets/images/auth/mail.png')
const personIconImage = require('../../../assets/images/auth/person.png')

/** Só dígitos, insere traços: DD-MM-AAAA */
function formatDDMMYYYY(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`
}

function convertDDMMYYYYtoYYYYMMDD(ddMmYyyy) {
  const parts = ddMmYyyy.split('-').map((p) => p.trim())
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  if (year.length !== 4) return null
  const dd = day.padStart(2, '0')
  const mm = month.padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackTone, setFeedbackTone] = useState('neutral')

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password || !birthDate.trim()) {
      setFeedbackTone('error')
      setFeedbackMessage('Preencha nome, e-mail, senha e data de nascimento para continuar.')
      return
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/
    if (!dateRegex.test(birthDate.trim())) {
      setFeedbackTone('error')
      setFeedbackMessage('Data de nascimento deve estar no formato DD-MM-AAAA (ex: 15-03-1995).')
      return
    }

    const [day, month, year] = birthDate.split('-')
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
    if (
      isNaN(dateObj.getTime()) ||
      dateObj.getFullYear() !== Number(year) ||
      dateObj.getMonth() !== Number(month) - 1 ||
      dateObj.getDate() !== Number(day)
    ) {
      setFeedbackTone('error')
      setFeedbackMessage('Data de nascimento inválida.')
      return
    }

    const dataNascimentoBackend = convertDDMMYYYYtoYYYYMMDD(birthDate.trim())
    if (!dataNascimentoBackend) {
      setFeedbackTone('error')
      setFeedbackMessage('Data de nascimento inválida.')
      return
    }

    try {
      setSubmitting(true)
      setFeedbackMessage('')
      await register({
        name,
        email,
        password,
        data_nascimento: dataNascimentoBackend,
        genero: 'Nao Informado',
        cidade: 'Nao Informada',
        estado: 'Nao Informado',
        pais: 'Nao Informado',
      })
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
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        iconSource={lockIconImage}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <AuthInput
        iconSource={lockIconImage}
        placeholder="Data de nascimento (DD-MM-AAAA)"
        value={birthDate}
        onChangeText={(t) => setBirthDate(formatDDMMYYYY(t))}
        maxLength={10}
        keyboardType="number-pad"
      />
    </AuthLayout>
  )
}
