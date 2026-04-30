import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')

export default function ScreenHero({
  title,
  subtitle,
  accentIcon,
  onBackPress,
  accentStyle,
  titleStyle,
}) {
  return (
    <View style={styles.heroCard}>
      <Pressable style={styles.backButton} onPress={onBackPress}>
        <Image source={backArrowIcon} style={styles.backArrow} resizeMode="contain" />
      </Pressable>

      <View style={styles.heroContent}>
        <View style={styles.heroTitleRow}>
          <Text style={[styles.heroTitle, titleStyle]}>{title}</Text>
          <Image
            source={accentIcon}
            style={[styles.heroAccentIcon, accentStyle]}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.heroDivider} />
    </View>
  )
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#F4F7FB',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 46,
    paddingHorizontal: 36,
    paddingBottom: 30,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    width: 18,
    height: 18,
  },
  heroContent: {
    marginTop: 34,
    paddingHorizontal: 18,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#1E293B',
    fontSize: 34,
    lineHeight: 38,
    fontFamily: 'Poppins_700Bold',
  },
  heroAccentIcon: {
    width: 36,
    height: 36,
    marginLeft: 12,
    marginTop: 6,
  },
  heroSubtitle: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Poppins_500Medium',
  },
  heroDivider: {
    marginTop: 24,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E3EBF4',
  },
})
