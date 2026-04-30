import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ScreenState from '../../components/common/ScreenState'
import ElevatedCard from '../../components/home/ElevatedCard'
import { useAuth } from '../../context/AuthContext'
import useAsyncData from '../../hooks/useAsyncData'
import { getHomeDashboard } from '../../services/dashboardService'

const avatarImage = require('../../../assets/images/home/avatar.png')
const notificationIcon = require('../../../assets/images/home/notification.png')
const savingsIcon = require('../../../assets/images/home/savings.png')
const waterIcon = require('../../../assets/images/home/water.png')
const energyIcon = require('../../../assets/images/home/energy.png')
const rankingBadge = require('../../../assets/images/home/rankingBadge.png')
const rankingTrophy = require('../../../assets/images/home/rankingTrophy.png')

const resourceIcons = {
  water: waterIcon,
  energy: energyIcon,
}

function ConsumptionCard({
  title,
  value,
  icon,
  iconTint,
  valueColor,
  progressColor,
  progressBackground,
  width,
  onPress,
}) {
  return (
    <Pressable style={[styles.metricCard, { width }]} onPress={onPress}>
      <ElevatedCard style={styles.metricCardSurface}>
        <View style={[styles.metricIconWrap, { backgroundColor: iconTint }]}>
          <Image source={icon} style={styles.metricIcon} resizeMode="contain" />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>

        <View style={styles.metricProgressSlot}>
          <View style={[styles.metricProgressTrack, { backgroundColor: progressBackground }]}>
            <View style={[styles.metricProgressFill, { backgroundColor: progressColor }]} />
          </View>
        </View>
      </ElevatedCard>
    </Pressable>
  )
}

function RankingRow({ position, name, house, delta, isLast }) {
  return (
    <View style={[styles.rankingRow, !isLast && styles.rankingDivider]}>
      <View style={styles.rankingPosition}>
        <Text style={styles.rankingPositionText}>{position}</Text>
      </View>

      <View style={styles.rankingTextBlock}>
        <Text style={styles.rankingName}>{name}</Text>
        <Text style={styles.rankingHouse}>{house}</Text>
      </View>

      <Text style={styles.rankingDelta}>{delta}</Text>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsyncData(getHomeDashboard, [])
  const { width } = useWindowDimensions()
  const horizontalMargin = 45
  const metricsGap = 16
  const metricCardWidth = (width - horizontalMargin * 2 - metricsGap) / 2

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <Pressable style={styles.profileRow} onPress={() => navigation.navigate('Profile')}>
                <View style={styles.avatarWrap}>
                  <Image source={avatarImage} style={styles.avatarImage} resizeMode="cover" />
                  <View style={styles.avatarOutline} />
                </View>

                <View>
                  <Text style={styles.greeting}>Bom dia,</Text>
                  <Text style={styles.username}>{user?.firstName || 'Usuário'}</Text>
                </View>
              </Pressable>

              <Pressable style={styles.notificationButton}>
                <Image source={notificationIcon} style={styles.notificationIcon} resizeMode="contain" />
              </Pressable>
            </View>

            <View style={styles.headerBottomRow}>
              <Text style={styles.sectionTitle}>
                {`Resumo de ${data?.monthLabel || 'maio'}`}
              </Text>
              <View style={styles.activeGoalPill}>
                <Text style={styles.activeGoalText}>{data?.activeGoalLabel || 'Meta ativa'}</Text>
              </View>
            </View>
          </View>

          <ElevatedCard style={styles.savingsCard}>
            <View>
              <Text style={styles.savingsLabel}>Economia estimada</Text>
              <Text style={styles.savingsValue}>{data?.estimatedSavings || 'R$ 0,00'}</Text>
            </View>

            <View style={styles.savingsIconWrap}>
              <Image source={savingsIcon} style={styles.savingsIcon} resizeMode="contain" />
            </View>
          </ElevatedCard>

          <View style={styles.metricsRow}>
            {(data?.consumptionCards || []).map((card) => (
              <ConsumptionCard
                key={card.title}
                {...card}
                icon={resourceIcons[card.resourceKey]}
                width={metricCardWidth}
                onPress={() => navigation.navigate(card.routeName)}
              />
            ))}
          </View>

          {loading ? (
            <ScreenState compact title="Carregando dashboard" description="Buscando seus dados." />
          ) : null}

          {error ? (
            <ScreenState
              compact
              title="Não foi possível carregar a home"
              description="Tente novamente em instantes."
              actionLabel="Recarregar"
              onActionPress={reload}
            />
          ) : null}

          <Text style={[styles.sectionTitle, styles.rankingTitle]}>Ranking da vizinhança</Text>

          <Pressable style={styles.rankingSection} onPress={() => navigation.navigate('Ranking')}>
            <Image source={rankingBadge} style={styles.rankingBadge} resizeMode="contain" />
            <View style={styles.rankingTrophyWrap}>
              <Image source={rankingTrophy} style={styles.rankingTrophy} resizeMode="contain" />
            </View>

            <ElevatedCard style={styles.rankingCard}>
              {(data?.neighborhoodRanking || []).map((item, index) => (
                <RankingRow
                  key={item.position}
                  {...item}
                  isLast={index === data.neighborhoodRanking.length - 1}
                />
              ))}
            </ElevatedCard>
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
    paddingBottom: 170,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 53,
    paddingHorizontal: 30,
    paddingBottom: 23,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 5.1,
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  avatarOutline: {
    position: 'absolute',
    width: 69,
    height: 69,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: '#0096C7',
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  greeting: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '400',
  },
  username: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 21,
    fontFamily: 'Poppins_700Bold',
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 5.1,
    elevation: 3,
  },
  headerBottomRow: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'Poppins_700Bold',
  },
  activeGoalPill: {
    minWidth: 111,
    height: 27,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  activeGoalText: {
    color: '#0096C7',
    fontSize: 14,
    lineHeight: 15,
    fontWeight: '500',
  },
  savingsCard: {
    marginTop: 35,
    marginHorizontal: 45,
    paddingVertical: 24,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsLabel: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '400',
  },
  savingsValue: {
    marginTop: 10,
    color: '#10B981',
    fontSize: 30,
    lineHeight: 32,
    fontFamily: 'Poppins_700Bold',
  },
  savingsIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsIcon: {
    width: 26,
    height: 26,
  },
  metricsRow: {
    marginTop: 34,
    marginHorizontal: 45,
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    height: 171,
  },
  metricCardSurface: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 23,
  },
  metricIconWrap: {
    width: 46,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    width: 24,
    height: 24,
  },
  metricTitle: {
    marginTop: 14,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 15,
    fontWeight: '400',
  },
  metricValue: {
    marginTop: 8,
    fontSize: 20,
    lineHeight: 21,
    fontFamily: 'Poppins_700Bold',
  },
  metricProgressSlot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  metricProgressTrack: {
    height: 7,
    borderRadius: 30,
    overflow: 'hidden',
  },
  metricProgressFill: {
    width: '61%',
    height: '100%',
    borderRadius: 30,
  },
  rankingTitle: {
    marginTop: 35,
    marginLeft: 45,
  },
  rankingSection: {
    marginTop: 28,
    marginHorizontal: 45,
    alignItems: 'center',
  },
  rankingBadge: {
    position: 'absolute',
    top: -13,
    width: 60,
    height: 60,
    zIndex: 1,
  },
  rankingTrophyWrap: {
    position: 'absolute',
    top: -10,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 2,
  },
  rankingTrophy: {
    width: 20,
    height: 20,
    marginTop: -1,
  },
  rankingCard: {
    width: '100%',
    paddingTop: 36,
    paddingHorizontal: 22,
    paddingBottom: 9,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rankingDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D7EAF7',
  },
  rankingPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingPositionText: {
    color: '#FFB703',
    fontSize: 20,
    lineHeight: 21,
    fontWeight: '600',
  },
  rankingTextBlock: {
    flex: 1,
    marginLeft: 10,
  },
  rankingName: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 17,
    fontFamily: 'Poppins_700Bold',
  },
  rankingHouse: {
    marginTop: 5,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 15,
    fontWeight: '400',
  },
  rankingDelta: {
    color: '#10B981',
    fontSize: 16,
    lineHeight: 17,
    fontWeight: '600',
  },
})
