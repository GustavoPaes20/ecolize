import { Image, Platform, StyleSheet, TextInput, View } from 'react-native'

export default function AuthInput({
  iconSource,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  maxLength,
  keyboardType,
  autoCapitalize = 'sentences',
}) {
  return (
    <View style={styles.inputShell}>
      <View style={styles.inputContent}>
        <Image source={iconSource} style={styles.inputIcon} resizeMode="contain" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          selectionColor="#1E293B"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inputShell: {
    width: '100%',
    height: 59,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CBD5E1',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontSize: 16,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
})
