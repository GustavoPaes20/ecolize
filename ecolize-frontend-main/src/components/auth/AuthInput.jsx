import { Image, ImageBackground, StyleSheet, TextInput, View } from 'react-native'

const inputBgImage = require('../../../assets/images/auth/inputBg.png')

export default function AuthInput({
  iconSource,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
}) {
  return (
    <ImageBackground
      source={inputBgImage}
      resizeMode="stretch"
      style={styles.inputBackground}
      imageStyle={styles.inputBackgroundImage}
    >
      <View style={styles.inputContent}>
        <Image source={iconSource} style={styles.inputIcon} resizeMode="contain" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  inputBackground: {
    width: '100%',
    height: 59,
    justifyContent: 'center',
  },
  inputBackgroundImage: {
    borderRadius: 30,
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
    color: '#64748B',
    fontSize: 16,
    paddingVertical: 0,
  },
})
