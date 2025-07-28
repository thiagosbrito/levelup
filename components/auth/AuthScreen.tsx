import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoginForm } from './LoginForm';
import { RegisterParentForm } from './RegisterParentForm';

export type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);

  const renderAuthForm = () => {
    switch (currentMode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setCurrentMode('register')}
            onSwitchToForgotPassword={() => setCurrentMode('forgot-password')}
            onSuccess={onAuthSuccess}
          />
        );
      case 'register':
        return (
          <RegisterParentForm
            onSwitchToLogin={() => setCurrentMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setCurrentMode('login')}
            onSuccess={() => setCurrentMode('login')}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentMode) {
      case 'login':
        return 'Welcome Back!';
      case 'register':
        return 'Create Parent Account';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (currentMode) {
      case 'login':
        return 'Sign in to manage your family tasks and activities';
      case 'register':
        return 'Join LevelUp to start organizing your family';
      case 'forgot-password':
        return 'Enter your email to receive a password reset link';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {getTitle()}
            </ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              {getSubtitle()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.formContainer}>
            {renderAuthForm()}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
