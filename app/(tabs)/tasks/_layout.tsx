import { Stack } from 'expo-router';

export default function TasksStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Tasks',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="task-details"
        options={{
          title: 'Task Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create-task"
        options={{
          title: 'Create Task',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
