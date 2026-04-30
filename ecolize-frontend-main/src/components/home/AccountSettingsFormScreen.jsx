import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView as ContextSafeAreaView } from 'react-native-safe-area-context'

const backArrowIcon = require('../../../assets/images/home/backArrowSmall.png')
const inputBackgroundImage = require('../../../assets/images/auth/inputBg.png')

function FormField({
  iconSource,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
}) {
  return (
    <ImageBackground
      source={inputBackgroundImage}
      resizeMode="stretch"
      style={styles.inputBackground}
      imageStyle={styles.inputBackgroundImage}
    >
      <View style={styles.inputContent}>
        <Image source={iconSource} style={styles.inputIcon} resizeMode="contain" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />
        {secureTextEntry ? (
          <Pressable
            style={styles.visibilityButton}
            onPress={onTogglePasswordVisibility}
            hitSlop={10}
          >
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </Pressable>
        ) : null}
      </View>
    </ImageBackground>
  )
}

export default function AccountSettingsFormScreen({
  navigation,
  title,
  fields,
  buttonText,
  onSubmit,
  submitDisabled = false,
  feedbackMessage,
  feedbackTone = 'neutral',
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.initialValue ?? '']))
  )
  const [visiblePasswords, setVisiblePasswords] = useState({})

  function updateField(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }))
  }

  function togglePasswordVisibility(key) {
    setVisiblePasswords((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <ContextSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={styles.headerTitle}>{title}</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.formStack}>
            {fields.map((field) => (
              <FormField
                key={field.key}
                iconSource={field.iconSource}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChangeText={(nextValue) => updateField(field.key, nextValue)}
                secureTextEntry={field.secureTextEntry}
                isPasswordVisible={visiblePasswords[field.key]}
                onTogglePasswordVisibility={() => togglePasswordVisibility(field.key)}
              />
            ))}
          </View>

          <Pressable
            style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}
            onPress={() => onSubmit?.(values)}
            disabled={submitDisabled}
          >
            <Text style={styles.submitButtonText}>{buttonText}</Text>
          </Pressable>

          {feedbackMessage ? (
            <Text
              style={[
                styles.feedbackText,
                feedbackTone === 'error' && styles.feedbackTextError,
                feedbackTone === 'success' && styles.feedbackTextSuccess,
              ]}
            >
              {feedbackMessage}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </ContextSafeAreaView>
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
    paddingTop: 62,
    paddingBottom: 40,
  },
  headerRow: {
    marginHorizontal: 22,
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
  formStack: {
    marginTop: 22,
    marginHorizontal: 29,
    gap: 15,
  },
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
    paddingHorizontal: 22,
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
    lineHeight: 20,
    fontFamily: 'Poppins_500Medium',
    paddingVertical: 0,
  },
  visibilityButton: {
    marginLeft: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    height: 43,
    marginTop: 28,
    marginHorizontal: 29,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 5.1,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 18,
    fontFamily: 'Poppins_700Bold',
  },
  feedbackText: {
    marginTop: 12,
    marginHorizontal: 29,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  feedbackTextError: {
    color: '#B42318',
  },
  feedbackTextSuccess: {
    color: '#10B981',
  },
})
