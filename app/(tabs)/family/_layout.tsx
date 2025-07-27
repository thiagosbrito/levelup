import { Stack } from 'expo-router';

export default function FamilyStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Family',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="member-details"
        options={{
          title: 'Member Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add-member"
        options={{
          title: 'Add Family Member',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
