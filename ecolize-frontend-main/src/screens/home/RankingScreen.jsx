import { useMemo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import ScreenState from '../../components/common/ScreenState'
import ElevatedCard from '../../components/home/ElevatedCard'
import HomeFeatureScreen from '../../components/home/HomeFeatureScreen'
import ScreenHero from '../../components/home/ScreenHero'
import useAsyncData from '../../hooks/useAsyncData'
import { getRanking } from '../../services/rankingService'

const chartIcon = require('../../../assets/images/home/barChart.png')
const rankingCrownIcon = require('../../../assets/images/home/rankingCrown.png')
const rankingGroupIcon = require('../../../assets/images/home/rankingGroup.png')
const waterIcon = require('../../../assets/images/home/water.png')
const energyIcon = require('../../../assets/images/home/energy.png')

const FILTERS = {
  water: {
    key: 'water',
    label: 'Água',
    icon: waterIcon,
    tint: '#1294C8',
    soft: '#E3F2FC',
  },
  energy: {
    key: 'energy',
    label: 'Energia',
    icon: energyIcon,
    tint: '#FFB703',
    soft: '#FFF6D5',
  },
}

function SummaryCard({ icon, label, value }) {
  return (
    <ElevatedCard style={styles.summaryCard}>
      <Image source={icon} style={styles.summaryIcon} resizeMode="contain" />

      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </ElevatedCard>
  )
}

function FilterChip({ item, active, onPress }) {
  return (
    <Pressable
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
        active && { backgroundColor: '#FFFFFF' },
      ]}
      onPress={onPress}
    >
      <Image
        source={item.icon}
        style={[styles.filterIcon, { tintColor: active ? item.tint : '#6B7A93' }]}
        resizeMode="contain"
      />
      <Text style={[styles.filterLabel, active && { color: item.tint }]}>{item.label}</Text>
    </Pressable>
  )
}

function RankBadge({ place }) {
  const palette =
    place === 1
      ? { stroke: '#FBBF24', fill: '#FFF6DB', text: '#F59E0B', ribbonLeft: '#1D4ED8', ribbonRight: '#2563EB' }
      : place === 2
        ? { stroke: '#B8C2CC', fill: '#F4F7FA', text: '#64748B', ribbonLeft: '#475569', ribbonRight: '#64748B' }
        : place === 3
          ? { stroke: '#C98012', fill: '#FDE7C7', text: '#C98012', ribbonLeft: '#0F766E', ribbonRight: '#14B8A6' }
          : { stroke: '#64748B', fill: '#F2F5F9', text: '#64748B', ribbonLeft: '#64748B', ribbonRight: '#64748B' }

  if (place > 3) {
    return (
      <View style={styles.rankNumberWrap}>
        <Text style={styles.rankNumberText}>#{place}</Text>
      </View>
    )
  }

  return (
    <View style={styles.rankBadgeWrap}>
      <View style={styles.rankMedalTop}>
        <View style={[styles.rankMedalRibbon, { backgroundColor: palette.ribbonLeft, transform: [{ rotate: '-8deg' }] }]} />
        <View style={[styles.rankMedalRibbon, { backgroundColor: palette.ribbonRight, transform: [{ rotate: '8deg' }] }]} />
      </View>

      <View style={[styles.rankBadgeCircle, { borderColor: palette.stroke, backgroundColor: palette.fill }]}>
        <View style={[styles.rankBadgeInnerCircle, { borderColor: palette.stroke }]}>
          <Text style={[styles.rankBadgeText, { color: palette.text }]}>{place}</Text>
        </View>
      </View>
    </View>
  )
}

function RankingRow({ item }) {
  return (
    <ElevatedCard style={styles.rankingRowCard}>
      <RankBadge place={item.place} />

      <View style={styles.rankingTextBlock}>
        <Text style={styles.rankingName}>{item.name}</Text>
        <Text style={styles.rankingSavings}>{item.savings}</Text>
      </View>
    </ElevatedCard>
  )
}

export default function RankingScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('water')
  const { data, loading, error, reload } = useAsyncData(() => getRanking(activeFilter), [activeFilter])

  const activeData = useMemo(
    () =>
      data || {
        summary: { position: '--', participants: '--' },
        items: [],
      },
    [data]
  )

  return (
    <HomeFeatureScreen
      activeKey="trophy"
      onHomePress={() => navigation.navigate('Home')}
      onGoalsPress={() => navigation.navigate('Goals')}
      onProfilePress={() => navigation.navigate('Profile')}
    >
      <ScreenHero
        title="Rankings"
        subtitle="Compare seu desempenho."
        accentIcon={chartIcon}
        accentStyle={styles.heroChartIcon}
        titleStyle={styles.heroTitleFix}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.summaryRow}>
        <SummaryCard
          icon={rankingCrownIcon}
          label="Posição Geral"
          value={activeData.summary.position}
        />

        <SummaryCard
          icon={rankingGroupIcon}
          label="Participantes"
          value={activeData.summary.participants}
        />
      </View>

      <View style={styles.filterWrap}>
        {Object.values(FILTERS).map((item) => (
          <FilterChip
            key={item.key}
            item={item}
            active={item.key === activeFilter}
            onPress={() => setActiveFilter(item.key)}
          />
        ))}
      </View>

      {loading ? (
        <ScreenState compact title="Carregando ranking" description="Buscando seu comparativo." />
      ) : null}

      {error ? (
        <ScreenState
          compact
          title="Não foi possível carregar o ranking"
          description="Tente novamente em instantes."
          actionLabel="Recarregar"
          onActionPress={reload}
        />
      ) : null}

      <View style={styles.rankingList}>
        {activeData.items.map((item) => (
          <RankingRow key={`${activeFilter}-${item.place}-${item.name}`} item={item} />
        ))}
      </View>
    </HomeFeatureScreen>
  )
}

const styles = StyleSheet.create({
  heroChartIcon: {
    width: 42,
    height: 42,
    tintColor: '#1CBD84',
  },
  heroTitleFix: {
    lineHeight: 42,
  },
  summaryRow: {
    marginTop: 34,
    marginHorizontal: 45,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    aspectRatio: 1,
    minHeight: 176,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 22,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
  summaryIcon: {
    width: 54,
    height: 54,
  },
  summaryLabel: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryValue: {
    marginTop: 8,
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  filterWrap: {
    marginTop: 28,
    marginHorizontal: 45,
    padding: 8,
    borderRadius: 34,
    backgroundColor: '#DCE5F1',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterChip: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  filterLabel: {
    color: '#6B7A93',
    fontSize: 17,
    lineHeight: 20,
    fontFamily: 'Poppins_700Bold',
  },
  rankingList: {
    marginTop: 30,
    marginHorizontal: 45,
    gap: 12,
  },
  rankingRowCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 32,
  },
  rankBadgeWrap: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankMedalTop: {
    width: 34,
    height: 14,
    marginBottom: -3,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  rankMedalRibbon: {
    width: 10,
    height: 16,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  rankBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeInnerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins_700Bold',
  },
  rankNumberWrap: {
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    color: '#64748B',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
  },
  rankingTextBlock: {
    flex: 1,
    marginLeft: 14,
  },
  rankingName: {
    color: '#1E293B',
    fontSize: 17,
    lineHeight: 21,
    fontFamily: 'Poppins_600SemiBold',
  },
  rankingSavings: {
    marginTop: 6,
    color: '#1CBD84',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '500',
  },
})
