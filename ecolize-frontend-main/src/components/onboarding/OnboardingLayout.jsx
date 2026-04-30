import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { cores } from '../../constants/cores'

const { width, height } = Dimensions.get('window')

export default function OnboardingLayout({
  children,
  title,
  description,
  index,
  total,
  onNext,
  onSkip,
  onBack,
  cor
}) {
  return (
    <View style={styles.container}>

      {children}

      {onBack && (
        <TouchableOpacity style={styles.botaoVoltar} onPress={onBack}>
          <Text style={[styles.voltarTexto, { color: cor.titulo }]}>‹</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.botaoPular} onPress={onSkip}>
        <Text style={styles.pularTexto}>Pular</Text>
      </TouchableOpacity>

      <View style={styles.conteudo}>
        <Text style={[styles.titulo, { color: cor.titulo }]}>{title}</Text>
        <Text style={styles.descricao}>{description}</Text>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index && {
                backgroundColor: cor.dot,
                width: width * 0.08
              }
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.botaoProximo, { backgroundColor: cor.botao }]}
        onPress={onNext}
      >
        <Text style={styles.setaTexto}>›</Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundoClaro,
  },

  botaoVoltar: {
    position: 'absolute',
    top: height * 0.065,
    left: width * 0.05,
    zIndex: 10,
  },
  voltarTexto: {
    fontSize: width * 0.08,
  },

  botaoPular: {
    position: 'absolute',
    top: height * 0.068,
    right: width * 0.06,
    zIndex: 10,
  },
  pularTexto: {
    fontSize: width * 0.038,
    color: '#888',
    fontWeight: '500',
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.04,
  },
  titulo: {
    fontFamily: 'Poppins_700Bold',
    fontSize: width * 0.075,
    lineHeight: width * 0.095,
    marginBottom: height * 0.02,
  },
  descricao: {
    fontSize: width * 0.038,
    color: cores.textoEscuro,
    lineHeight: width * 0.06,
  },

  dots: {
    position: 'absolute',
    bottom: height * 0.055,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.02,
  },
  dot: {
    width: width * 0.04,
    height: height * 0.01,
    borderRadius: width * 0.01,
    backgroundColor: cores.cinzaClaro,
  },

  botaoProximo: {
    position: 'absolute',
    bottom: height * 0.06,
    right: width * 0.07,
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setaTexto: {
    color: cores.branco,
    fontSize: width * 0.08,
  },
})
