import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { cn } from '@/utils/cn';

export default function TasksScreen() {
  // Mock tasks data
  const taskStats = {
    total: 12,
    completed: 8,
    pending: 4,
    overdue: 1,
  };

  const tasksByCategory = [
    {
      category: 'Chores',
      icon: '🧹',
      color: 'bg-success-100',
      tasks: [
        { id: 1, title: 'Clean your room', coins: 50, completed: false, priority: 'high', dueDate: 'Today' },
        { id: 2, title: 'Take out trash', coins: 25, completed: true, priority: 'medium', dueDate: 'Today' },
        { id: 3, title: 'Load dishwasher', coins: 30, completed: false, priority: 'low', dueDate: 'Tomorrow' },
      ]
    },
    {
      category: 'Homework',
      icon: '📚',
      color: 'bg-secondary-100',
      tasks: [
        { id: 4, title: 'Math homework', coins: 75, completed: true, priority: 'high', dueDate: 'Today' },
        { id: 5, title: 'Science project', coins: 100, completed: false, priority: 'high', dueDate: 'Friday' },
        { id: 6, title: 'Read chapter 5', coins: 40, completed: false, priority: 'medium', dueDate: 'Wednesday' },
      ]
    },
    {
      category: 'Personal',
      icon: '🎯',
      color: 'bg-primary-100',
      tasks: [
        { id: 7, title: 'Practice piano', coins: 60, completed: false, priority: 'medium', dueDate: 'Today' },
        { id: 8, title: 'Exercise 30 min', coins: 45, completed: true, priority: 'low', dueDate: 'Today' },
      ]
    }
  ];

  const completionRate = (taskStats.completed / taskStats.total) * 100;

  return (
    <ScrollView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-neutral-800 font-display">
              My Tasks 📋
            </Text>
            <Text className="text-base text-neutral-500">
              {taskStats.completed} of {taskStats.total} completed today
            </Text>
          </View>
          <Button variant="primary" size="sm">
            Add Task
          </Button>
        </View>

        {/* Progress Overview */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-semibold text-neutral-700">Daily Progress</Text>
            <Text className="text-sm text-neutral-500">
              {Math.round(completionRate)}% Complete
            </Text>
          </View>
          <ProgressBar progress={completionRate} variant="thick" />
        </Card>
      </View>

      {/* Task Stats */}
      <View className="px-4 mb-6">
        <View className="flex-row gap-2">
          <Card variant="elevated" className="flex-1 items-center py-3">
            <Text className="text-lg font-bold text-neutral-600">
              {taskStats.pending}
            </Text>
            <Text className="text-xs text-neutral-500">Pending</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-3">
            <Text className="text-lg font-bold text-success-500">
              {taskStats.completed}
            </Text>
            <Text className="text-xs text-neutral-500">Completed</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-3">
            <Text className="text-lg font-bold text-error-500">
              {taskStats.overdue}
            </Text>
            <Text className="text-xs text-neutral-500">Overdue</Text>
          </Card>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-4 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {['All', 'Today', 'This Week', 'Overdue', 'Completed'].map((filter, index) => (
            <TouchableOpacity
              key={filter}
              className={cn(
                'px-4 py-2 rounded-full',
                index === 0 ? 'bg-primary-500' : 'bg-neutral-100'
              )}
            >
              <Text className={cn(
                'text-sm font-medium',
                index === 0 ? 'text-white' : 'text-neutral-600'
              )}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks by Category */}
      {tasksByCategory.map((category) => (
        <View key={category.category} className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className={cn('p-2 rounded-lg mr-3', category.color)}>
                <Text className="text-lg">{category.icon}</Text>
              </View>
              <Text className="text-lg font-bold text-neutral-800">
                {category.category}
              </Text>
              <Badge variant="free" className="ml-2">
                {category.tasks.length}
              </Badge>
            </View>
            <TouchableOpacity>
              <Text className="text-primary-500 font-medium text-sm">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="gap-2">
            {category.tasks.map((task) => (
              <Card key={task.id} variant="interactive">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className={cn(
                        'font-medium mr-2',
                        task.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'
                      )}>
                        {task.title}
                      </Text>
                      {task.priority === 'high' && (
                        <Badge variant="new">
                          High
                        </Badge>
                      )}
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-neutral-500 mr-4">
                        +{task.coins} coins
                      </Text>
                      <Text className="text-xs text-neutral-400">
                        Due {task.dueDate}
                      </Text>
                    </View>
                  </View>
                  
                  <View className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    task.completed 
                      ? 'bg-success-500 border-success-500' 
                      : 'border-neutral-300'
                  )}>
                    {task.completed && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      ))}

      {/* Quick Actions */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</Text>
        <View className="gap-3">
          <Button variant="secondary" className="flex-row items-center">
            <Text className="mr-2">📊</Text>
            <Text className="text-white">View Task Analytics</Text>
          </Button>
          <Button variant="ghost" className="flex-row items-center">
            <Text className="mr-2">🏆</Text>
            <Text className="text-neutral-700">View Rewards Store</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
