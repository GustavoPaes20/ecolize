import { useMemo, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import ScreenState from '../../components/common/ScreenState'
import ElevatedCard from '../../components/home/ElevatedCard'
import HomeFeatureScreen from '../../components/home/HomeFeatureScreen'
import ScreenHero from '../../components/home/ScreenHero'
import useAsyncData from '../../hooks/useAsyncData'
import { getGoals, GOAL_CONFIG, updateGoal } from '../../services/goalsService'

const trendUpIcon = require('../../../assets/images/home/trendUp.png')
const errorIcon = require('../../../assets/images/home/error.png')
const waterIcon = require('../../../assets/images/home/water.png')
const energyIcon = require('../../../assets/images/home/energy.png')
const chevronRightIcon = require('../../../assets/images/home/chevronRight.png')

const GOAL_UI_CONFIG = {
  water: {
    icon: waterIcon,
    iconTint: '#DDF0FB',
    pillBackground: '#E5F3FB',
  },
  energy: {
    icon: energyIcon,
    iconTint: '#FFF3CC',
    pillBackground: '#FFF6CF',
  },
}

function GoalStepperCard({ title, subtitle, icon, iconTint, pillBackground, value, cost, onChange }) {
  return (
    <ElevatedCard style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={[styles.goalIconWrap, { backgroundColor: iconTint }]}>
          <Image source={icon} style={styles.goalIcon} resizeMode="contain" />
        </View>

        <View style={styles.goalTitleBlock}>
          <Text style={styles.goalTitle}>{title}</Text>
          <Text style={styles.goalSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={[styles.stepperPill, { backgroundColor: pillBackground }]}>
        <Text style={styles.stepperValue}>{value}</Text>

        <View style={styles.stepperControls}>
          <Pressable hitSlop={8} onPress={() => onChange(1)} style={styles.stepperButton}>
            <Image
              source={chevronRightIcon}
              style={[styles.stepperChevron, styles.stepperChevronUp]}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable hitSlop={8} onPress={() => onChange(-1)} style={styles.stepperButton}>
            <Image
              source={chevronRightIcon}
              style={[styles.stepperChevron, styles.stepperChevronDown]}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.goalDivider} />

      <View style={styles.goalFooter}>
        <Text style={styles.goalCostLabel}>Custo estimado:</Text>
        <Text style={styles.goalCostValue}>{cost}</Text>
      </View>
    </ElevatedCard>
  )
}

export default function GoalsScreen({ navigation }) {
  const { data, loading, error, reload, setData } = useAsyncData(getGoals, [])
  const goals = useMemo(() => data?.values || { water: 0, energy: 0 }, [data])
  const costs = useMemo(
    () => data?.costs || { water: 'R$ 0,00', energy: 'R$ 0,00' },
    [data]
  )

  async function handleGoalChange(resourceKey, direction) {
    const nextData = await updateGoal(resourceKey, direction)
    setData(nextData)
  }

  return (
    <HomeFeatureScreen
      activeKey="goals"
      onHomePress={() => navigation.navigate('Home')}
      onTrophyPress={() => navigation.navigate('Ranking')}
      onProfilePress={() => navigation.navigate('Profile')}
    >
      <ScreenHero
        title="Metas"
        subtitle="Ajuste seus limites mensais."
        accentIcon={trendUpIcon}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.tipCardWrap}>
        <View style={styles.tipShadow} />
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Image source={errorIcon} style={styles.tipIcon} resizeMode="contain" />
          </View>

          <View style={styles.tipTextBlock}>
            <Text style={styles.tipTitle}>Dica Ecolize</Text>
            <Text style={styles.tipDescription}>
              Tente reduzir 10% da sua meta anterior para um desafio sustentavel e possivel.
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ScreenState compact title="Carregando metas" description="Buscando seus limites atuais." />
      ) : null}

      {error ? (
        <ScreenState
          compact
          title="Não foi possível carregar as metas"
          description="Tente novamente em instantes."
          actionLabel="Recarregar"
          onActionPress={reload}
        />
      ) : null}

      <GoalStepperCard
        title={GOAL_CONFIG.water.title}
        subtitle={GOAL_CONFIG.water.subtitle}
        icon={GOAL_UI_CONFIG.water.icon}
        iconTint={GOAL_UI_CONFIG.water.iconTint}
        pillBackground={GOAL_UI_CONFIG.water.pillBackground}
        value={goals.water}
        cost={costs.water}
        onChange={(direction) => handleGoalChange('water', direction)}
      />

      <GoalStepperCard
        title={GOAL_CONFIG.energy.title}
        subtitle={GOAL_CONFIG.energy.subtitle}
        icon={GOAL_UI_CONFIG.energy.icon}
        iconTint={GOAL_UI_CONFIG.energy.iconTint}
        pillBackground={GOAL_UI_CONFIG.energy.pillBackground}
        value={goals.energy}
        cost={costs.energy}
        onChange={(direction) => handleGoalChange('energy', direction)}
      />
    </HomeFeatureScreen>
  )
}

const styles = StyleSheet.create({
  tipCardWrap: {
    marginTop: 26,
    marginHorizontal: 45,
  },
  tipShadow: {
    position: 'absolute',
    top: 7,
    left: 8,
    right: 8,
    bottom: -7,
    borderRadius: 34,
    backgroundColor: '#000000',
    opacity: 0.08,
  },
  tipCard: {
    borderRadius: 30,
    backgroundColor: '#1CBD84',
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#15C98A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  tipIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
  },
  tipTextBlock: {
    flex: 1,
    marginLeft: 14,
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_700Bold',
  },
  tipDescription: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
  },
  goalCard: {
    marginTop: 24,
    marginHorizontal: 45,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  goalIcon: {
    width: 28,
    height: 28,
  },
  goalTitleBlock: {
    flex: 1,
    marginLeft: 14,
  },
  goalTitle: {
    color: '#1E293B',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
  },
  goalSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  stepperPill: {
    alignSelf: 'center',
    width: '74%',
    minHeight: 58,
    borderRadius: 29,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 18,
  },
  stepperValue: {
    color: '#1E293B',
    fontSize: 19,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
  },
  stepperControls: {
    gap: 2,
  },
  stepperButton: {
    width: 24,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperChevron: {
    width: 13,
    height: 13,
  },
  stepperChevronUp: {
    transform: [{ rotate: '90deg' }],
  },
  stepperChevronDown: {
    transform: [{ rotate: '-90deg' }],
  },
  goalDivider: {
    marginTop: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#E5EAF0',
  },
  goalFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCostLabel: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  goalCostValue: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_700Bold',
  },
})
