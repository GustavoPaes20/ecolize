import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ElevatedCard from '../../components/home/ElevatedCard'

const calendarMonthIcon = require('../../../assets/images/home/calendarMonth.png')
const chartIcon = require('../../../assets/images/home/barChart.png')
const errorIcon = require('../../../assets/images/home/error.png')
const chevronRightIcon = require('../../../assets/images/home/chevronRight.png')
const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')
const trendUpIcon = require('../../../assets/images/home/trendUp.png')
const settingsIcon = require('../../../assets/images/home/settings.png')
const addButtonIcon = require('../../../assets/images/home/addButton.png')

function WeekChartCard({ bars, colors }) {
  return (
    <ElevatedCard style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Esta semana</Text>
        <View style={[styles.chartIconWrap, { backgroundColor: colors.soft }]}>
          <Image source={chartIcon} style={styles.chartIcon} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.chartBarsRow}>
        {bars.map((bar) => (
          <View key={bar.label} style={styles.barColumn}>
            <View
              style={[
                styles.chartBar,
                {
                  height: bar.height,
                  backgroundColor: bar.active ? colors.primary : colors.soft,
                },
              ]}
            />
            <Text style={[styles.barLabel, bar.active && styles.barLabelActive]}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </ElevatedCard>
  )
}

export default function ResourceDetailsScreen({
  navigation,
  title,
  icon,
  currentValue,
  comparisonText,
  tipText,
  colors,
  bars,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <View style={styles.topActionsRow}>
              <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Image source={backArrowIcon} style={styles.backArrow} resizeMode="contain" />
              </Pressable>

              <Text style={[styles.heroTitle, { color: colors.primary }]}>{title}</Text>

              <Pressable style={styles.iconButton}>
                <Image source={settingsIcon} style={styles.settingsIcon} resizeMode="contain" />
              </Pressable>
            </View>

            <View style={styles.heroCenter}>
              <View style={[styles.heroIconWrap, { backgroundColor: colors.soft }]}>
                <Image source={icon} style={styles.heroIcon} resizeMode="contain" />
              </View>
              <Text style={styles.heroLabel}>Consumo atual</Text>
              <Text style={[styles.heroValue, { color: colors.primary }]}>{currentValue}</Text>
            </View>

            <View style={styles.comparisonPill}>
              <Image source={trendUpIcon} style={styles.comparisonIcon} resizeMode="contain" />
              <Text style={styles.comparisonText}>{comparisonText}</Text>
            </View>
          </View>

          <ElevatedCard style={styles.historyCard}>
            <View style={[styles.historyIconWrap, { backgroundColor: colors.soft }]}>
              <Image source={calendarMonthIcon} style={styles.historyIcon} resizeMode="contain" />
            </View>

            <View style={styles.historyTextBlock}>
              <Text style={styles.historyTitle}>Histórico de faturas</Text>
              <Text style={styles.historySubtitle}>Compare com os meses passados.</Text>
            </View>

            <Image source={chevronRightIcon} style={styles.historyChevron} resizeMode="contain" />
          </ElevatedCard>

          <WeekChartCard bars={bars} colors={colors} />

          <ElevatedCard style={styles.tipCard}>
            <View style={[styles.tipIconWrap, { backgroundColor: colors.soft }]}>
              <Image source={errorIcon} style={styles.tipIcon} resizeMode="contain" />
            </View>

            <View style={styles.tipTextBlock}>
              <Text style={styles.tipTitle}>Dica Ecolize</Text>
              <Text style={styles.tipDescription}>{tipText}</Text>
            </View>
          </ElevatedCard>
        </ScrollView>

        <Pressable
          style={styles.bottomDock}
          onPress={() => navigation.navigate('Home', { screen: 'Goals' })}
        >
          <Image source={addButtonIcon} style={styles.addButton} resizeMode="contain" />
          <Text style={styles.addLabel}>Adicionar meta</Text>
          <View style={styles.homeIndicator} />
        </Pressable>
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
    paddingBottom: 180,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 43,
    paddingHorizontal: 29,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 5.1,
    elevation: 4,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 18,
    height: 18,
  },
  settingsIcon: {
    width: 28,
    height: 28,
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_700Bold',
  },
  heroCenter: {
    marginTop: 27,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    width: 30,
    height: 34,
  },
  heroLabel: {
    marginTop: 14,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  heroValue: {
    marginTop: 8,
    fontSize: 36,
    lineHeight: 40,
    fontFamily: 'Poppins_700Bold',
  },
  comparisonPill: {
    marginTop: 18,
    alignSelf: 'center',
    minHeight: 27,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 8,
  },
  comparisonIcon: {
    width: 14,
    height: 14,
  },
  comparisonText: {
    color: '#10B981',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '600',
  },
  historyCard: {
    marginTop: 36,
    marginHorizontal: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  historyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIcon: {
    width: 34,
    height: 34,
  },
  historyTextBlock: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  historyTitle: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_700Bold',
  },
  historySubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  historyChevron: {
    width: 16,
    height: 16,
    transform: [{ scaleX: -1 }],
  },
  chartCard: {
    marginTop: 34,
    marginHorizontal: 45,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTitle: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_700Bold',
  },
  chartIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartIcon: {
    width: 24,
    height: 24,
  },
  chartBarsRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 210,
  },
  barColumn: {
    alignItems: 'center',
  },
  chartBar: {
    width: 27,
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
  },
  barLabelActive: {
    color: '#1E293B',
  },
  tipCard: {
    marginTop: 36,
    marginHorizontal: 45,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 19,
    paddingBottom: 22,
  },
  tipIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIcon: {
    width: 34,
    height: 34,
  },
  tipTextBlock: {
    flex: 1,
    marginLeft: 10,
  },
  tipTitle: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  },
  tipDescription: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5.1,
    elevation: 10,
  },
  addButton: {
    position: 'absolute',
    top: -31,
    width: 64,
    height: 64,
  },
  addLabel: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '500',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000000',
  },
})
