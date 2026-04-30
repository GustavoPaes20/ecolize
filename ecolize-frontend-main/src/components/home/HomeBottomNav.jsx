import { Image, Pressable, StyleSheet, View } from 'react-native'

const homeIcon = require('../../../assets/images/home/homeIcon.png')
const goalsIcon = require('../../../assets/images/home/goalsIcon.png')
const trophyIcon = require('../../../assets/images/home/trophyIcon.png')
const profileIcon = require('../../../assets/images/home/profileIcon.png')

function BottomNavItem({ icon, active = false, onPress }) {
  return (
    <Pressable style={styles.bottomNavItem} onPress={onPress}>
      <Image source={icon} style={styles.bottomNavIcon} resizeMode="contain" />
      {active ? <View style={styles.bottomNavActiveBar} /> : null}
    </Pressable>
  )
}

export default function HomeBottomNav({
  activeKey = 'home',
  onHomePress,
  onGoalsPress,
  onTrophyPress,
  onProfilePress,
}) {
  return (
    <View style={styles.bottomNav}>
      <BottomNavItem icon={homeIcon} active={activeKey === 'home'} onPress={onHomePress} />
      <BottomNavItem icon={goalsIcon} active={activeKey === 'goals'} onPress={onGoalsPress} />
      <BottomNavItem icon={trophyIcon} active={activeKey === 'trophy'} onPress={onTrophyPress} />
      <BottomNavItem icon={profileIcon} active={activeKey === 'profile'} onPress={onProfilePress} />
    </View>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 114,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingHorizontal: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 5.1,
    elevation: 10,
  },
  bottomNavItem: {
    width: 54,
    alignItems: 'center',
  },
  bottomNavIcon: {
    width: 36,
    height: 36,
  },
  bottomNavActiveBar: {
    marginTop: 10,
    width: 54,
    height: 7,
    backgroundColor: '#1CA1CE',
  },
})
