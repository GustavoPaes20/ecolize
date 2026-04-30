import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function ScreenState({ title, description, actionLabel, onActionPress, compact = false }) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onActionPress ? (
        <Pressable style={styles.button} onPress={onActionPress}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 36,
    marginHorizontal: 45,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  containerCompact: {
    marginTop: 18,
  },
  title: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  button: {
    marginTop: 14,
    minWidth: 140,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'Poppins_700Bold',
  },
})
