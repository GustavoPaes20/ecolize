import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context'

const backArrowImage = require('../../../assets/images/auth/backArrow.png')
const bottomBlobImage = require('../../../assets/images/auth/bottomBlob.png')
const topBlobImage = require('../../../assets/images/auth/topBlob.png')

export default function AuthLayout({
  navigation,
  title,
  subtitle,
  children,
  buttonText,
  onSubmit,
  footerText,
  footerLinkText,
  onFooterPress,
  verticalOffset = 0,
  submitDisabled = false,
  feedbackMessage,
  feedbackTone = 'neutral',
}) {
  return (
    <SafeAreaContextView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image source={topBlobImage} style={styles.topBlob} resizeMode="contain" />
        <Image source={bottomBlobImage} style={styles.bottomBlob} resizeMode="contain" />

        <Pressable
          style={[styles.backButton, verticalOffset !== 0 && { transform: [{ translateY: verticalOffset }] }]}
          onPress={() => navigation.goBack()}
        >
          <Image source={backArrowImage} style={styles.backArrow} resizeMode="contain" />
        </Pressable>

        <View
          style={[styles.content, verticalOffset !== 0 && { transform: [{ translateY: verticalOffset }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>{children}</View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.primaryButton, submitDisabled && styles.primaryButtonDisabled]}
              onPress={onSubmit}
              disabled={submitDisabled}
            >
              <Text style={styles.primaryButtonText}>{buttonText}</Text>
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

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>{footerText}</Text>
              <Pressable onPress={onFooterPress}>
                <Text style={styles.footerLink}>{footerLinkText}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.homeIndicator} />
      </KeyboardAvoidingView>
    </SafeAreaContextView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF4FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF4FA',
    overflow: 'hidden',
  },
  topBlob: {
    position: 'absolute',
    top: -40,
    right: -18,
    width: 176,
    height: 206,
    transform: [{ rotate: '180deg' }],
  },
  bottomBlob: {
    position: 'absolute',
    left: -26,
    bottom: -50,
    width: 208,
    height: 226,
  },
  backButton: {
    position: 'absolute',
    top: 68,
    left: 29,
    width: 50,
    height: 50,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 50,
    height: 50,
    transform: [{ scaleX: -1 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 29,
    paddingTop: 162,
    paddingBottom: 84,
  },
  header: {
    marginBottom: 46,
  },
  title: {
    width: 216,
    color: '#1E293B',
    fontSize: 32,
    lineHeight: 34,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    width: 291,
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  form: {
    gap: 34,
  },
  actions: {
    marginTop: 68,
    alignItems: 'center',
  },
  primaryButton: {
    width: 258,
    height: 54,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
    fontFamily: 'Poppins_700Bold',
  },
  feedbackText: {
    marginTop: 12,
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
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  footerLink: {
    color: '#1E293B',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000000',
  },
})
