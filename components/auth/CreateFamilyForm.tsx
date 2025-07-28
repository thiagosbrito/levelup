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
import { familyCreationSchema } from '../../utils/validation/schemas';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface CreateFamilyFormProps {
  onSuccess?: () => void;
}

export const CreateFamilyForm: React.FC<CreateFamilyFormProps> = ({
  onSuccess,
}) => {
  const { createFamily } = useAuth();
  const [formData, setFormData] = useState({
    familyName: '',
    familyDescription: '',
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    try {
      familyCreationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      if (error.issues) {
        error.issues.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };

  const handleCreateFamily = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await createFamily(formData);
      
      if (response.success) {
        Alert.alert(
          'Family Created!',
          `Welcome to your family space! Your family code is: ${response.data?.family_code}\n\nShare this code with family members so they can join.`,
          [{ text: 'Get Started', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Creation Failed', response.error || 'An error occurred while creating your family');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerIcon}>👨‍👩‍👧‍👦</ThemedText>
        <ThemedText style={styles.headerText}>
          Let&apos;s create your family space! This is where you&apos;ll manage tasks, events, and connect with your family members.
        </ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Family Name *</ThemedText>
        <TextInput
          testID="family-name-input"
          style={[styles.input, errors.familyName && styles.inputError]}
          value={formData.familyName}
          onChangeText={(value) => updateField('familyName', value)}
          placeholder="e.g., The Smith Family"
          autoCapitalize="words"
          editable={!isLoading}
        />
        {errors.familyName && (
          <ThemedText style={styles.errorText}>{errors.familyName}</ThemedText>
        )}
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Family Description (Optional)</ThemedText>
        <TextInput
          testID="family-description-input"
          style={[styles.input, styles.textArea, errors.familyDescription && styles.inputError]}
          value={formData.familyDescription}
          onChangeText={(value) => updateField('familyDescription', value)}
          placeholder="Tell us a bit about your family..."
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
          editable={!isLoading}
        />
        {errors.familyDescription && (
          <ThemedText style={styles.errorText}>{errors.familyDescription}</ThemedText>
        )}
      </View>

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoTitle}>💡 What happens next?</ThemedText>
        <ThemedText style={styles.infoText}>
          • You&apos;ll get a unique family code to share with family members{'\n'}
          • Family members can join using this code{'\n'}
          • You can start creating tasks and events right away{'\n'}
          • Children will need parent approval to join
        </ThemedText>
      </View>

      <TouchableOpacity
        testID="create-family-button"
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={handleCreateFamily}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Create My Family</Text>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1E40AF',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
