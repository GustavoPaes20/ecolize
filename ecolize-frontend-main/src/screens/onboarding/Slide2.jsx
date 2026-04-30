import { View, Image, StyleSheet, Dimensions } from 'react-native'
import { cores } from '../../constants/cores'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'

const { width, height } = Dimensions.get('window')

export default function Slide2({ navigation }) {
  return (
    <OnboardingLayout
      title={"Controle total na\npalma da mão."}
      description={
        "Defina metas mensais de gastos em Reais e acompanhe, em tempo real, quanto você já consumiu de água e luz. Acabe com o susto na hora de abrir o boleto no fim do mês."
      }
      index={1}
      total={3}
      cor={cores.azul}
      onNext={() => navigation.navigate('Slide3')}
      onSkip={() => navigation.replace('Register')}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.ilustracaoContainer}>
        <Image source={require('../../../assets/images/onboarding/vector2.png')} style={styles.blob} />
        <View style={styles.sol} />
        <Image source={require('../../../assets/images/onboarding/tablet.png')} style={styles.tablet} />
        <Image source={require('../../../assets/images/onboarding/linha_azul.png')} style={styles.linha} />
        <Image source={require('../../../assets/images/onboarding/arvores_azuis.png')} style={styles.arvores} />
        <Image source={require('../../../assets/images/onboarding/mulher.png')} style={styles.mulher} />
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
    width: width * 1,
    height: height * 0.5,
    top: height * 0.07,
    alignSelf: 'center',
    zIndex: 0,
    resizeMode: 'contain',
  },
  sol: {
    position: 'absolute',
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#F5A623',
    top: height * 0.05,
    alignSelf: 'center',
    zIndex: 1,
  },
  tablet: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.7,
    top: height * 0.165,
    zIndex: 2,
    resizeMode: 'contain',
  },
  linha: {
    position: 'absolute',
    width: width * 0.70,
    height: height * 0.005,
    bottom: height * 0.025,
    zIndex: 3,
    resizeMode: 'contain',
  },
  arvores: {
    position: 'absolute',
    width: width * 0.2,
    height: width * 0.2,
    bottom: height * 0.025,
    left: width * 0.14,
    zIndex: 4,
    resizeMode: 'contain',
  },
  mulher: {
    position: 'absolute',
    width: width * 0.24,
    height: width * 0.38,
    bottom: height * 0.028,
    right: width * 0.18,
    zIndex: 4,
    resizeMode: 'contain',
  },
})
