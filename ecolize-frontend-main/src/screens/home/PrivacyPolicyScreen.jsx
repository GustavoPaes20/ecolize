import SupportArticleScreen from '../../components/home/SupportArticleScreen'

const PRIVACY_SECTIONS = [
  {
    paragraphs: [
      'Esta política detalha como os dados são tratados em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD).',
    ],
  },
  {
    title: '1. Dados Recolhidos',
    bullets: [
      'Dados de Identificação: Nome, e-mail e informações de contato fornecidas no registro.',
      'Dados de Consumo em Tempo Real: Fluxo de água e carga elétrica monitorizados pelos sensores.',
      'Metadados Técnicos: Endereço IP, tipo de dispositivo e logs de conectividade para garantir a segurança da rede.',
    ],
  },
  {
    title: '2. Finalidade do Tratamento de Dados A recolha de dados tem como finalidade exclusiva:',
    bullets: [
      'Processar e exibir gráficos de consumo em tempo real.',
      'Emitir alertas proativos de picos de gasto ou possíveis fugas.',
      'Gerar relatórios de desempenho ambiental e economia financeira.',
      'Personalizar sugestões de eficiência energética com base no perfil de uso.',
    ],
  },
  {
    title: '3. Segurança e Confidencialidade',
    paragraphs: [
      'A privacidade do lar é tratada com prioridade máxima. Todos os dados transmitidos entre os sensores instalados e os nossos servidores são protegidos por criptografia de ponta a ponta. O acesso aos dados brutos de consumo é restrito ao utilizador titular da conta.',
    ],
  },
  {
    title: '4. Partilha de Dados',
    paragraphs: [
      'O aplicativo não comercializa dados pessoais ou de consumo com terceiros. Informações agregadas e anonimizadas (sem identificação do utilizador) poderão ser utilizadas apenas para estudos estatísticos sobre eficiência energética global.',
    ],
  },
  {
    title: '5. Direitos do Titular (LGPD) O utilizador possui o direito de, a qualquer momento:',
    bullets: [
      'Confirmar a existência do tratamento e aceder aos seus dados.',
      'Solicitar a correção de dados incompletos ou desatualizados.',
      'Eliminação de Dados: Solicitar a exclusão definitiva da conta e de todo o histórico recolhido pelos sensores nos nossos servidores.',
    ],
  },
  {
    title: '6. Retenção de Informação',
    paragraphs: [
      'Os dados são mantidos enquanto a conta estiver ativa. Em caso de encerramento da conta, os dados são eliminados ou anonimizados em até 30 dias úteis, salvo se houver obrigação legal de retenção.',
    ],
  },
]

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SupportArticleScreen
      navigation={navigation}
      title={`Política de\nPrivacidade`}
      sections={PRIVACY_SECTIONS}
    />
  )
}
