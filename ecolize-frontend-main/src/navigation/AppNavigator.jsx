import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import HomeBottomNav from '../components/home/HomeBottomNav'
import ScreenState from '../components/common/ScreenState'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import ChangePasswordScreen from '../screens/home/ChangePasswordScreen'
import EnergyDetailsScreen from '../screens/home/EnergyDetailsScreen'
import EmailSettingsScreen from '../screens/home/EmailSettingsScreen'
import FaqScreen from '../screens/home/FaqScreen'
import GoalsScreen from '../screens/home/GoalsScreen'
import HomeScreen from '../screens/home/HomeScreen'
import PersonalInfoScreen from '../screens/home/PersonalInfoScreen'
import PrivacyPolicyScreen from '../screens/home/PrivacyPolicyScreen'
import ProfileScreen from '../screens/home/ProfileScreen'
import RankingScreen from '../screens/home/RankingScreen'
import SettingsScreen from '../screens/home/SettingsScreen'
import TermsOfUseScreen from '../screens/home/TermsOfUseScreen'
import WaterDetailsScreen from '../screens/home/WaterDetailsScreen'
import Slide1 from '../screens/onboarding/Slide1'
import Slide2 from '../screens/onboarding/Slide2'
import Slide3 from '../screens/onboarding/Slide3'

const Stack = createNativeStackNavigator()
const MainStack = createNativeStackNavigator()

const routeKeys = {
  HomeMain: 'home',
  Goals: 'goals',
  Ranking: 'trophy',
  Profile: 'profile',
}

function MainHomeNavigator({ navigation }) {
  const [activeKey, setActiveKey] = useState('home')

  function navigateMain(screenName, key) {
    setActiveKey(key)
    navigation.navigate('Home', { screen: screenName })
  }

  return (
    <View style={styles.mainShell}>
      <MainStack.Navigator
        initialRouteName="HomeMain"
        screenOptions={{ headerShown: false }}
        screenListeners={{
          state: (event) => {
            const state = event.data.state
            const routeName = state.routes[state.index]?.name
            const nextKey = routeKeys[routeName]

            if (nextKey) {
              setActiveKey(nextKey)
            }
          },
        }}
      >
        <MainStack.Screen name="HomeMain" component={HomeScreen} />
        <MainStack.Screen name="Goals" component={GoalsScreen} />
        <MainStack.Screen name="Ranking" component={RankingScreen} />
        <MainStack.Screen name="Profile" component={ProfileScreen} />
      </MainStack.Navigator>

      <HomeBottomNav
        activeKey={activeKey}
        onHomePress={() => navigateMain('HomeMain', 'home')}
        onGoalsPress={() => navigateMain('Goals', 'goals')}
        onTrophyPress={() => navigateMain('Ranking', 'trophy')}
        onProfilePress={() => navigateMain('Profile', 'profile')}
      />
    </View>
  )
}

export default function AppNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <ScreenState title="Carregando sessão" description="Preparando seu ambiente." />
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'private-stack' : 'public-stack'}
      initialRouteName={isAuthenticated ? 'Home' : 'Slide1'}
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Slide1" component={Slide1} />
          <Stack.Screen name="Slide2" component={Slide2} />
          <Stack.Screen name="Slide3" component={Slide3} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={MainHomeNavigator} />
          <Stack.Screen name="WaterDetails" component={WaterDetailsScreen} />
          <Stack.Screen name="EnergyDetails" component={EnergyDetailsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="EmailSettings" component={EmailSettingsScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Faq" component={FaqScreen} />
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  mainShell: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
})
