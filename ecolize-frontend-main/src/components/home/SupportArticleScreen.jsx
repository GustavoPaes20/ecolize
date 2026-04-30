import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')

export default function SupportArticleScreen({
  navigation,
  title,
  subtitle = 'Tire suas dúvidas conosco.',
  sections,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.headerDivider} />

          <View style={styles.contentWrap}>
            {sections.map((section, index) => (
              <View key={`${section.title || 'intro'}-${index}`} style={styles.section}>
                {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}

                {section.paragraphs?.map((paragraph) => (
                  <Text key={paragraph} style={section.title ? styles.bodyText : styles.introText}>
                    {paragraph}
                  </Text>
                ))}

                {section.bullets?.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
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
    paddingBottom: 32,
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
    marginTop: 12,
    marginHorizontal: 45,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_500Medium',
  },
  headerDivider: {
    marginTop: 16,
    marginHorizontal: 45,
    height: 1,
    backgroundColor: '#D9E3EE',
  },
  contentWrap: {
    marginTop: 24,
    marginHorizontal: 45,
  },
  section: {
    marginBottom: 22,
  },
  introText: {
    color: '#64748B',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Poppins_600SemiBold',
  },
  bodyText: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
  },
  bulletRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  bulletMarker: {
    width: 14,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
  },
  bulletText: {
    flex: 1,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
  },
})
