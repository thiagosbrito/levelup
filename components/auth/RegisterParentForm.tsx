import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { parentRegistrationSchema } from '../../utils/validation/schemas';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface RegisterParentFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  error?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ value, onValueChange, label, error, disabled }) => (
  <View style={styles.checkboxContainer}>
    <TouchableOpacity
      style={[styles.checkbox, value && styles.checkboxChecked, error && styles.checkboxError]}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
    >
      {value && <Text style={styles.checkboxTick}>✓</Text>}
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.checkboxLabelContainer}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
    >
      <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
    </TouchableOpacity>
    {error && (
      <ThemedText style={styles.errorText}>{error}</ThemedText>
    )}
  </View>
);

export const RegisterParentForm: React.FC<RegisterParentFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { registerParent } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    termsAccepted: false,
    privacyPolicyAccepted: false,
    marketingOptIn: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      parentRegistrationSchema.parse(formData);
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

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerParent(formData);
      
      if (response.success) {
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your account before proceeding.',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Registration Failed', response.error || 'An error occurred during registration');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Email *</ThemedText>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
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

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Password *</ThemedText>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            placeholder="Create a strong password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {errors.password && (
            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
          )}
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Confirm Password *</ThemedText>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {errors.confirmPassword && (
            <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
          )}
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Display Name *</ThemedText>
          <TextInput
            style={[styles.input, errors.displayName && styles.inputError]}
            value={formData.displayName}
            onChangeText={(value) => updateField('displayName', value)}
            placeholder="How should we display your name?"
            autoCapitalize="words"
            editable={!isLoading}
          />
          {errors.displayName && (
            <ThemedText style={styles.errorText}>{errors.displayName}</ThemedText>
          )}
        </View>

        <Checkbox
          value={formData.termsAccepted}
          onValueChange={(value) => updateField('termsAccepted', value)}
          label="I accept the Terms of Service"
          error={errors.termsAccepted}
          disabled={isLoading}
        />

        <Checkbox
          value={formData.privacyPolicyAccepted}
          onValueChange={(value) => updateField('privacyPolicyAccepted', value)}
          label="I accept the Privacy Policy"
          error={errors.privacyPolicyAccepted}
          disabled={isLoading}
        />

        <Checkbox
          value={formData.marketingOptIn}
          onValueChange={(value) => updateField('marketingOptIn', value)}
          label="I'd like to receive updates and promotional emails (optional)"
          disabled={isLoading}
        />

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <ThemedText style={styles.switchText}>
            Already have an account?{' '}
          </ThemedText>
          <TouchableOpacity
            onPress={onSwitchToLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.switchButtonText}>
              Sign In
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  agreementText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxError: {
    borderColor: '#EF4444',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
});
