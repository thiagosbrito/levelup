import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CreateFamilyForm } from '../../components/auth/CreateFamilyForm';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function CreateFamilyScreen() {
  const handleFamilyCreated = () => {
    // Redirect to main app after family creation
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Create Your Family</ThemedText>
        <ThemedText style={styles.subtitle}>
          Set up your family space to start managing tasks and activities together.
        </ThemedText>
      </View>

      <CreateFamilyForm onSuccess={handleFamilyCreated} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});