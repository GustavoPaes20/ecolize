import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ScreenState from '../../components/common/ScreenState'
import ElevatedCard from '../../components/home/ElevatedCard'
import { useAuth } from '../../context/AuthContext'
import useAsyncData from '../../hooks/useAsyncData'
import { getProfileOverview } from '../../services/profileService'

const avatarImage = require('../../../assets/images/home/avatar.png')
const avatarOutline = require('../../../assets/images/home/avatarOutline.png')
const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')
const settingsIcon = require('../../../assets/images/home/settings.png')
const chartIcon = require('../../../assets/images/home/barChart.png')

function StatItem({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function HistoryChart({ chartGroups, leftScale, rightScale }) {
  return (
    <ElevatedCard style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Histórico (3 meses)</Text>

        <View style={styles.chartIconWrap}>
          <Image source={chartIcon} style={styles.chartIcon} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.scaleColumn}>
          {leftScale.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.scaleText}>
              {item}
            </Text>
          ))}
        </View>

        <View style={styles.barsWrap}>
          {chartGroups.map((item) => (
            <View key={item.month} style={styles.monthGroup}>
              <View style={styles.barPair}>
                <View style={[styles.bar, styles.waterBar, { height: item.water }]} />
                <View style={[styles.bar, styles.energyBar, { height: item.energy }]} />
              </View>
              <Text style={styles.monthLabel}>{item.month}</Text>
            </View>
          ))}
        </View>

        <View style={styles.scaleColumn}>
          {rightScale.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.scaleText}>
              {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.waterDot]} />
          <Text style={[styles.legendText, styles.waterLegend]}>Água (L)</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.energyDot]} />
          <Text style={[styles.legendText, styles.energyLegend]}>Energia (kWh)</Text>
        </View>
      </View>
    </ElevatedCard>
  )
}

export default function ProfileScreen({ navigation }) {
  const { logout } = useAuth()
  const { data, loading, error, reload } = useAsyncData(getProfileOverview, [])

  async function handleLogout() {
    await logout()
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
                <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
              </Pressable>

              <Text style={styles.headerTitle}>Perfil</Text>

              <Pressable style={styles.headerButton} onPress={() => navigation.navigate('Settings')}>
                <Image source={settingsIcon} style={styles.settingsIcon} resizeMode="contain" />
              </Pressable>
            </View>

            <View style={styles.avatarWrap}>
              <Image source={avatarImage} style={styles.avatarImage} resizeMode="cover" />
              <Image source={avatarOutline} style={styles.avatarOutline} resizeMode="contain" />
            </View>

            <Text style={styles.profileName}>{data?.user?.fullName || 'Usuário'}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{data?.user?.badgeTitle || 'Guardião da natureza'}</Text>
            </View>
          </View>

          <ElevatedCard style={styles.statsCard}>
            {(data?.stats || []).map((item) => (
              <StatItem key={item.label} value={item.value} label={item.label} />
            ))}
          </ElevatedCard>

          {loading ? (
            <ScreenState compact title="Carregando perfil" description="Buscando suas informações." />
          ) : null}

          {error ? (
            <ScreenState
              compact
              title="Não foi possível carregar o perfil"
              description="Tente novamente em instantes."
              actionLabel="Recarregar"
              onActionPress={reload}
            />
          ) : null}

          {data?.history ? (
            <HistoryChart
              chartGroups={data.history.chartGroups}
              leftScale={data.history.leftScale}
              rightScale={data.history.rightScale}
            />
          ) : null}

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da conta</Text>
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
    minHeight: 332,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 62,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 5.1,
    elevation: 4,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  settingsIcon: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  avatarWrap: {
    width: 120,
    height: 120,
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  avatarOutline: {
    position: 'absolute',
    width: 128,
    height: 128,
  },
  profileName: {
    marginTop: 4,
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  badge: {
    marginTop: 16,
    width: 211,
    height: 27,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#0096C7',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  statsCard: {
    height: 64,
    marginTop: 36,
    marginHorizontal: 45,
    paddingHorizontal: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    width: 68,
    alignItems: 'center',
  },
  statValue: {
    color: '#1E293B',
    fontSize: 24,
    lineHeight: 26,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  statLabel: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  historyCard: {
    marginTop: 35,
    marginHorizontal: 45,
    paddingTop: 27,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 22,
    fontFamily: 'Poppins_600SemiBold',
  },
  chartIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 5.1,
    elevation: 4,
  },
  chartIcon: {
    width: 24,
    height: 24,
  },
  chartArea: {
    height: 206,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scaleColumn: {
    height: 190,
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  scaleText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  barsWrap: {
    flex: 1,
    height: 206,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  monthGroup: {
    width: 54,
    alignItems: 'center',
  },
  barPair: {
    height: 182,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 18,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  waterBar: {
    backgroundColor: '#0096C7',
  },
  energyBar: {
    backgroundColor: '#FFB703',
  },
  monthLabel: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  legendRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 17,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  waterDot: {
    backgroundColor: '#0096C7',
  },
  energyDot: {
    backgroundColor: '#FFB703',
  },
  legendText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  waterLegend: {
    color: '#0096C7',
  },
  energyLegend: {
    color: '#FFB703',
  },
  logoutButton: {
    height: 49,
    marginTop: 21,
    marginHorizontal: 45,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
})
