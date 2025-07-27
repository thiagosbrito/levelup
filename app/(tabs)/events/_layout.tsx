import { Stack } from 'expo-router';

export default function EventsStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Events',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="event-details"
        options={{
          title: 'Event Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-event"
        options={{
          title: 'Create Event',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
