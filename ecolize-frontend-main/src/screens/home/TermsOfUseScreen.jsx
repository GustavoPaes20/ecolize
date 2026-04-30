import SupportArticleScreen from '../../components/home/SupportArticleScreen'

const TERMS_SECTIONS = [
  {
    title: '1. Aceitação dos Termos',
    paragraphs: [
      'Ao aceder e utilizar este aplicativo, o utilizador concorda em cumprir e estar vinculado aos presentes Termos de Uso. Este software é uma ferramenta de gestão de recursos domésticos destinada a auxiliar no consumo consciente de água e energia elétrica.',
    ],
  },
  {
    title: '2. Descrição do Serviço e Tecnologia IoT',
    paragraphs: [
      'O sistema opera através da integração de sensores de Internet das Coisas (IoT) instalados nos medidores de consumo do imóvel.',
    ],
    bullets: [
      'Conectividade: O funcionamento contínuo depende da estabilidade da rede Wi-Fi do utilizador.',
      'Instalação: A configuração física dos sensores deve seguir rigorosamente as orientações de segurança fornecidas no guia de instalação do hardware.',
    ],
  },
  {
    title: '3. Precisão e Isenção de Responsabilidade',
    paragraphs: [
      'Os sensores possuem alta precisão técnica (aproximadamente 99%). No entanto, os valores convertidos em moeda corrente (R$) apresentados no painel de controlo são estimativas baseadas em tarifas médias e configurações do utilizador.',
      'O valor legal para pagamento será sempre o emitido pela fatura oficial da concessionária de serviços públicos.',
    ],
  },
  {
    title: '4. Obrigações do Utilizador',
    paragraphs: [
      'O utilizador compromete-se a utilizar o sistema de forma lícita, sendo proibida qualquer tentativa de engenharia reversa nos sensores, alteração de firmware não autorizada ou violação da segurança da plataforma.',
    ],
  },
  {
    title: '5. Alterações nos Serviços',
    paragraphs: [
      'Reservamo-nos o direito de atualizar as funcionalidades do aplicativo e os presentes termos para refletir melhorias técnicas ou mudanças regulatórias no setor de energia e saneamento.',
    ],
  },
]

export default function TermsOfUseScreen({ navigation }) {
  return (
    <SupportArticleScreen
      navigation={navigation}
      title="Termos de uso"
      sections={TERMS_SECTIONS}
    />
  )
}
