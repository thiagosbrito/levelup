import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, family, familyRole, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const response = await signOut();
            if (!response.success) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Profile</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Personal Information</ThemedText>
          <ThemedText>Welcome, {user?.display_name || user?.first_name || 'User'}!</ThemedText>
          <ThemedText>Email: {user?.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Family Role</ThemedText>
          <ThemedText>Role: {familyRole || 'Not assigned'}</ThemedText>
          <ThemedText>Family: {family?.name || 'No family'}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Preferences</ThemedText>
          <ThemedText>Customize your app experience and notifications</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account Settings</ThemedText>
          <ThemedText>Manage account security and privacy settings</ThemedText>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
