import { useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')
const chevronRightIcon = require('../../../assets/images/home/chevronRight.png')

const FAQ_SECTIONS = [
  {
    title: 'Sobre o aplicativo',
    items: [
      {
        id: 'real-time-monitoring',
        question: 'Como o monitoramento é feito em tempo real?',
        answer:
          'Diferente de outros apps, o nosso utiliza sensores inteligentes instalados diretamente nos seus medidores (relógios) de água e luz. Eles fazem a leitura constante do fluxo e enviam os dados via Wi-Fi para o seu celular a cada segundo.',
      },
      {
        id: 'install-meters',
        question: 'Preciso quebrar paredes ou trocar meus medidores?',
      },
      {
        id: 'wifi-outage',
        question: 'O app funciona se o Wi-Fi cair?',
      },
    ],
  },
  {
    title: 'Economia e Bolso',
    items: [
      {
        id: 'reduce-bill',
        question: 'Como os sensores ajudam a reduzir a conta?',
      },
      {
        id: 'predict-bill',
        question: 'Consigo prever o valor da fatura antes dela chegar?',
      },
      {
        id: 'flags',
        question: 'O app avisa sobre as "Bandeiras Tarifárias"?',
      },
    ],
  },
  {
    title: 'Sustentabilidade e Impacto',
    items: [
      {
        id: 'climate-crisis',
        question: 'Por que monitorar água e luz ajuda contra a crise climática?',
      },
      {
        id: 'ods',
        question: 'Como vejo minha contribuição para as ODS?',
      },
      {
        id: 'small-actions',
        question: 'Meu pequeno gesto realmente faz diferença?',
      },
    ],
  },
]

function FaqItem({ item, expanded, onPress, isLast }) {
  return (
    <Pressable style={[styles.questionRow, !isLast && styles.questionDivider]} onPress={onPress}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{item.question}</Text>
        <Image
          source={chevronRightIcon}
          style={[
            styles.questionChevron,
            expanded ? styles.questionChevronExpanded : styles.questionChevronCollapsed,
          ]}
          resizeMode="contain"
        />
      </View>

      {expanded && item.answer ? <Text style={styles.answerText}>{item.answer}</Text> : null}
    </Pressable>
  )
}

export default function FaqScreen({ navigation }) {
  const [openItemId, setOpenItemId] = useState('real-time-monitoring')

  function handleToggle(itemId) {
    setOpenItemId((current) => (current === itemId ? null : itemId))
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={styles.title}>Perguntas{'\n'}Frequentes</Text>
          <Text style={styles.subtitle}>Tire suas dúvidas conosco.</Text>
          <View style={styles.headerDivider} />

          {FAQ_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={styles.sectionList}>
                {section.items.map((item, index) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    expanded={openItemId === item.id}
                    onPress={() => handleToggle(item.id)}
                    isLast={index === section.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))}

          <Pressable style={styles.askButton}>
            <Text style={styles.askButtonText}>Faça uma pergunta</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    paddingTop: 75,
    paddingBottom: 42,
  },
  backButton: {
    marginLeft: 22,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  title: {
    marginTop: 22,
    marginHorizontal: 45,
    color: '#1E293B',
    fontSize: 32,
    lineHeight: 34,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    marginTop: 14,
    marginHorizontal: 45,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_500Medium',
  },
  headerDivider: {
    marginTop: 14,
    marginHorizontal: 45,
    height: 1,
    backgroundColor: '#D9E3EE',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 45,
  },
  sectionTitle: {
    color: '#0096C7',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionList: {
    marginTop: 10,
  },
  questionRow: {
    paddingTop: 14,
    paddingBottom: 14,
  },
  questionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9E3EE',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionText: {
    flex: 1,
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Poppins_600SemiBold',
    paddingRight: 16,
  },
  questionChevron: {
    width: 22,
    height: 22,
    marginTop: -1,
  },
  questionChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  questionChevronCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },
  answerText: {
    marginTop: 8,
    paddingRight: 28,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 17,
    fontFamily: 'Poppins_500Medium',
  },
  askButton: {
    height: 54,
    marginTop: 26,
    marginHorizontal: 71,
    borderRadius: 30,
    backgroundColor: '#0096C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 5.1,
    elevation: 4,
  },
  askButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
  },
})
