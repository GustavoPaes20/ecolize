import { View, Image, StyleSheet, Dimensions } from 'react-native'
import { cores } from '../../constants/cores'
import OnboardingLayout from '../../components/onboarding/OnboardingLayout'

const { width, height } = Dimensions.get('window')

export default function Slide3({ navigation }) {
  return (
    <OnboardingLayout
      title={"Sua economia\nprotege o futuro."}
      description={
        "Ao reduzir o desperdício, você ajuda a diminuir a pressão sobre nossas hidrelétricas e biomas. Pequenas ações contribuem diretamente para os Objetivos de Desenvolvimento Sustentável."
      }
      index={2}
      total={3}
      cor={cores.amarelo}
      onNext={() => navigation.replace('Register')}
      onSkip={() => navigation.replace('Register')}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.ilustracaoContainer}>
        <Image source={require('../../../assets/images/onboarding/vector3.png')} style={styles.blob} />
        <Image source={require('../../../assets/images/onboarding/mundo.png')} style={styles.globo} />
        <View style={styles.sol} />
        <Image source={require('../../../assets/images/onboarding/carteira.png')} style={styles.carteira} />
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
    width: width * 1.0,
    height: height * 0.52,
    top: height * 0.055,
  },
  globo: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
    top: height * 0.06,
    resizeMode: 'contain',
  },
  sol: {
    position: 'absolute',
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width,
    backgroundColor: '#F5A623',
    top: height * 0.27,
    left: width * 0.89,
  },
  carteira: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.75,
    top: height * 0.23,
    left: width * 0.08,
    resizeMode: 'contain',
  },
})
