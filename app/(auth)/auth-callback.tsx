import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function AuthCallbackScreen() {
  const { token_hash, type, error, error_description } = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    error?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for errors first
      if (error) {
        Alert.alert(
          'Authentication Error',
          error_description || 'An error occurred during authentication',
          [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
        );
        return;
      }

      // Verify the token if present
      if (token_hash && type) {
        try {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (verifyError) {
            Alert.alert(
              'Verification Failed',
              verifyError.message,
              [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
            );
            return;
          }

          if (data.user) {
            // Email confirmed successfully! 
            // Check if user has a family or needs to create one
            const { data: familyMember } = await supabase
              .from('family_members')
              .select('family_id')
              .eq('user_id', data.user.id)
              .single();

            if (familyMember) {
              // User has a family, redirect to main app
              router.replace('/(tabs)');
            } else {
              // User needs to create a family
              router.replace('/(auth)/create-family');
            }
          }
        } catch (error) {
          Alert.alert(
            'Verification Error',
            'Failed to verify your email. Please try again.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
          );
        }
      } else {
        // No token provided, redirect back to auth
        router.replace('/(auth)');
      }
    };

    handleAuthCallback();
  }, [token_hash, type, error, error_description]);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 16 }}>Verifying your email...</ThemedText>
    </ThemedView>
  );
}