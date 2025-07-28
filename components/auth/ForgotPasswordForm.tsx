import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { passwordResetSchema } from '../../utils/validation/schemas';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    try {
      passwordResetSchema.parse({ email });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({ email });
      
      if (response.success) {
        setIsSubmitted(true);
        Alert.alert(
          'Reset Email Sent',
          'Please check your email for password reset instructions.',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Reset Failed', response.error || 'An error occurred while sending reset email');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.successContainer}>
          <ThemedText style={styles.successIcon}>📧</ThemedText>
          <ThemedText style={styles.successTitle}>Email Sent!</ThemedText>
          <ThemedText style={styles.successMessage}>
            We&apos;ve sent password reset instructions to {email}.
            Please check your email and follow the link to reset your password.
          </ThemedText>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={onSwitchToLogin}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email Address</ThemedText>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.email && (
          <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
        )}
      </View>

      <ThemedText style={styles.instructionText}>
        Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
      </ThemedText>

      <TouchableOpacity
        style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.resetButtonText}>Send Reset Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={onSwitchToLogin}
        disabled={isLoading}
      >
        <ThemedText style={styles.backToLoginText}>
          ← Back to Sign In
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 150,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
