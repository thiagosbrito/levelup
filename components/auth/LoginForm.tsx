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
import { parentLoginSchema } from '../../utils/validation/schemas';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onSuccess,
}) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      parentLoginSchema.parse({ email, password });
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

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn({ email, password });
      
      if (response.success) {
        onSuccess?.();
      } else {
        Alert.alert('Login Failed', response.error || 'An error occurred during login');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.email && (
          <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
        )}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.password && (
          <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={onSwitchToForgotPassword}
        disabled={isLoading}
      >
        <ThemedText style={styles.forgotPasswordText}>
          Forgot Password?
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <ThemedText style={styles.switchText}>
          Don&apos;t have an account?{' '}
        </ThemedText>
        <TouchableOpacity
          onPress={onSwitchToRegister}
          disabled={isLoading}
        >
          <ThemedText style={styles.switchButtonText}>
            Sign Up
          </ThemedText>
        </TouchableOpacity>
      </View>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  switchButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});
