const defaultUser = {
  id: 'user-1',
  fullName: 'Mariana Reis',
  firstName: 'Mariana',
  email: 'reisjulis398@gmail.com',
  birthDate: '08/06/2004',
  gender: 'Feminino',
  countryState: 'Brasil, Amazonas',
  badgeTitle: 'Guardião da natureza',
  stats: [
    { value: '87', label: 'DIAS' },
    { value: '#4', label: 'RANK' },
    { value: '12', label: 'TROFÉUS' },
  ],
}

const profileHistory = {
  chartGroups: [
    { month: 'Jan', water: 154, energy: 134 },
    { month: 'Fev', water: 134, energy: 134 },
    { month: 'Mar', water: 154, energy: 182 },
  ],
  leftScale: ['12000', '9000', '6000', '6000', '0'],
  rightScale: ['220', '165', '110', '55', '0'],
}

const rankingData = {
  water: {
    summary: {
      position: '#4',
      participants: '1.780',
    },
    items: [
      { name: 'Gustavo Pães', savings: '27% de economia', place: 1 },
      { name: 'César Sobreira', savings: '20% de economia', place: 2 },
      { name: 'Arthur Renato', savings: '17% de economia', place: 3 },
      { name: 'Julia Reis', savings: '5% de economia', place: 4 },
    ],
  },
  energy: {
    summary: {
      position: '#7',
      participants: '1.780',
    },
    items: [
      { name: 'Marina Duarte', savings: '24% de economia', place: 1 },
      { name: 'Gustavo Pães', savings: '21% de economia', place: 2 },
      { name: 'Lívia Souza', savings: '18% de economia', place: 3 },
      { name: 'César Sobreira', savings: '9% de economia', place: 4 },
    ],
  },
}

const resources = {
  water: {
    title: 'Controle de Água',
    currentValue: '12.4m³',
    comparisonText: '12% melhor que o mês passado',
    tipText:
      'O pico no Sábado indica provável uso da máquina de lavar. Tente acumular mais roupas para uma única lavagem!',
    colors: {
      primary: '#0096C7',
      soft: '#E0F2FE',
    },
    bars: [
      { label: 'Seg', height: 123, active: false },
      { label: 'Ter', height: 146, active: false },
      { label: 'Quar', height: 123, active: false },
      { label: 'Qui', height: 108, active: false },
      { label: 'Sex', height: 138, active: false },
      { label: 'Sab', height: 174, active: true },
      { label: 'Dom', height: 153, active: false },
    ],
  },
  energy: {
    title: 'Controle de Luz',
    currentValue: '165 kWh',
    comparisonText: '8% melhor que o mês passado',
    tipText:
      'O pico no Sábado indica provável uso de equipamentos de alto consumo. Evite ligar vários aparelhos ao mesmo tempo.',
    colors: {
      primary: '#FFB703',
      soft: '#FEF3C7',
    },
    bars: [
      { label: 'Seg', height: 112, active: false },
      { label: 'Ter', height: 136, active: false },
      { label: 'Quar', height: 124, active: false },
      { label: 'Qui', height: 104, active: false },
      { label: 'Sex', height: 132, active: false },
      { label: 'Sab', height: 174, active: true },
      { label: 'Dom', height: 152, active: false },
    ],
  },
}

function createDashboard() {
  return {
    monthLabel: 'maio',
    activeGoalLabel: 'Meta ativa',
    estimatedSavings: 'R$ 76,60',
    consumptionCards: [
      {
        title: 'Consumo de Água',
        routeName: 'WaterDetails',
        value: '12.4 m³',
        resourceKey: 'water',
        valueColor: '#0096C7',
        progressColor: '#0096C7',
        progressBackground: '#D7EAF7',
        iconTint: '#E0F2FE',
      },
      {
        title: 'Consumo de Luz',
        routeName: 'EnergyDetails',
        value: '165 kWh',
        resourceKey: 'energy',
        valueColor: '#FFB703',
        progressColor: '#FFB703',
        progressBackground: '#FDF0C3',
        iconTint: '#FEF3C7',
      },
    ],
    neighborhoodRanking: [
      { position: '1', name: 'Gustavo Paes', house: 'Casa 07', delta: '-27%' },
      { position: '2', name: 'César Sobreira', house: 'Casa 13', delta: '-20%' },
    ],
  }
}

const settingsSupport = [
  { label: 'Perguntas Frequentes', type: 'internal', routeName: 'Faq' },
  { label: 'Termos de Serviço', type: 'internal', routeName: 'TermsOfUse' },
  { label: 'Política de privacidade', type: 'internal', routeName: 'PrivacyPolicy' },
  { label: 'Sair', type: 'logout' },
]

export const mockStore = {
  session: null,
  users: {
    [defaultUser.id]: {
      ...defaultUser,
      password: '123456',
    },
  },
  dashboard: createDashboard(),
  goals: {
    water: 15000,
    energy: 250,
  },
  ranking: rankingData,
  resources,
  profileHistory,
  settingsSupport,
}

export function getCurrentUser() {
  if (!mockStore.session?.userId) return null

  const user = mockStore.users[mockStore.session.userId]

  return user
    ? {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender,
        countryState: user.countryState,
        badgeTitle: user.badgeTitle,
        stats: user.stats,
      }
    : null
}

export function setCurrentUserSession(userId) {
  mockStore.session = {
    token: `mock-token-${userId}`,
    userId,
  }
}

export function clearCurrentUserSession() {
  mockStore.session = null
}
