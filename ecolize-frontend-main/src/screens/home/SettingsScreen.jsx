import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ScreenState from '../../components/common/ScreenState'
import { useAuth } from '../../context/AuthContext'
import useAsyncData from '../../hooks/useAsyncData'
import { getSettingsData } from '../../services/settingsService'

const avatarImage = require('../../../assets/images/home/avatar.png')
const avatarOutline = require('../../../assets/images/home/avatarOutline.png')
const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')
const chevronRightIcon = require('../../../assets/images/home/chevronRight.png')
const arrowOutwardIcon = require('../../../assets/images/home/arrowOutward.png')
const logoutIcon = require('../../../assets/images/home/logoutIcon.png')

function SettingsRow({ label, value, type, isLast, onPress }) {
  const trailingIcon =
    type === 'logout' ? logoutIcon : type === 'external' ? arrowOutwardIcon : chevronRightIcon

  const trailingStyle =
    type === 'logout' ? styles.logoutTrailingIcon : type === 'external' ? styles.externalTrailingIcon : styles.chevronTrailingIcon

  return (
    <Pressable style={[styles.row, !isLast && styles.rowDivider]} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>

      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Image source={trailingIcon} style={trailingStyle} resizeMode="contain" />
      </View>
    </Pressable>
  )
}

function SettingsSection({ title, items, onItemPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionDivider} />

      {items.map((item, index) => (
        <SettingsRow
          key={item.label}
          {...item}
          isLast={index === items.length - 1}
          onPress={() => onItemPress?.(item)}
        />
      ))}
    </View>
  )
}

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth()
  const { data, loading, error, reload } = useAsyncData(getSettingsData, [])

  function handleItemPress(item) {
    if (item.routeName) {
      navigation.navigate(item.routeName)
      return
    }

    if (item.type === 'logout') {
      logout().then(() =>
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      )
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
              </Pressable>

              <Text style={styles.headerTitle}>Configurações</Text>

              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Image source={avatarImage} style={styles.avatarImage} resizeMode="cover" />
                <Image source={avatarOutline} style={styles.avatarOutline} resizeMode="contain" />
              </View>

              <View style={styles.profileTextBlock}>
                <Text style={styles.profileName}>{data?.user?.fullName || 'Usuário'}</Text>
                <Text style={styles.profileEmail}>{data?.user?.email || '-'}</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <ScreenState compact title="Carregando configurações" description="Buscando seus dados." />
          ) : null}

          {error ? (
            <ScreenState
              compact
              title="Não foi possível carregar as configurações"
              description="Tente novamente em instantes."
              actionLabel="Recarregar"
              onActionPress={reload}
            />
          ) : null}

          {data ? (
            <>
              <SettingsSection
                title="Gerenciamento de conta"
                items={data.accountItems}
                onItemPress={handleItemPress}
              />

              <SettingsSection
                title="Suporte"
                items={data.supportItems}
                onItemPress={handleItemPress}
              />
            </>
          ) : null}
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
    paddingBottom: 60,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 62,
    paddingHorizontal: 22,
    paddingBottom: 26,
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
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  profileRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 23,
  },
  avatarWrap: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarOutline: {
    position: 'absolute',
    width: 75,
    height: 75,
  },
  profileTextBlock: {
    marginLeft: 14,
  },
  profileName: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'Poppins_700Bold',
  },
  profileEmail: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
  },
  section: {
    marginTop: 32,
    marginHorizontal: 45,
  },
  sectionTitle: {
    color: '#0096C7',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionDivider: {
    marginTop: 12,
    height: 1,
    backgroundColor: '#D9E3EE',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9E3EE',
  },
  rowLabel: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Poppins_600SemiBold',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowValue: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
  },
  chevronTrailingIcon: {
    width: 16,
    height: 16,
    transform: [{ scaleX: -1 }],
  },
  externalTrailingIcon: {
    width: 18,
    height: 18,
  },
  logoutTrailingIcon: {
    width: 16,
    height: 16,
  },
})
