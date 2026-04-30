import { View, Image, StyleSheet, Dimensions } from 'react-native'
import { cores } from '../../constants/cores'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'

const { width, height } = Dimensions.get('window')

export default function Slide1({ navigation }) {
  return (
    <OnboardingLayout
      title={"Controle sua casa.\nSalve o Planeta."}
      description={
        "O Ecolize é o seu aliado na gestão de recursos. Monitore seus gastos de energia e água em tempo real, economize no fim do mês e ajude a combater a crise climática através do consumo consciente."
      }
      index={0}
      total={3}
      cor={cores.verde}
      onNext={() => navigation.navigate('Slide2')}
      onSkip={() => navigation.replace('Home')}
    >
      <View style={styles.ilustracaoContainer}>
        <Image source={require('../../../assets/images/onboarding/vector1.png')} style={styles.blob} />
        <View style={styles.sol} />
        <Image source={require('../../../assets/images/onboarding/homem_arvore.png')} style={styles.ilustracao} />
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  ilustracaoContainer: {
    width: '100%',
    height: height * 0.58,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  blob: {
    position: 'absolute',
    width: width * 1.03,
    height: width * 1.03,
    top: height * 0.1,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  sol: {
    position: 'absolute',
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width * 0.08,
    backgroundColor: '#F5A623',
    top: height * 0.14,
    right: width * 0.025,
  },
  ilustracao: {
    position: 'absolute',
    width: width * 0.95,
    height: width * 0.95,
    bottom: -height * 0.04,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
})
