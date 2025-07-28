import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card, Button, Badge, Avatar, ProgressBar } from '@/components/ui';
import { cn } from '@/utils/cn';

export default function HomeScreen() {
  // Mock data - in real app would come from state/API
  const userStats = {
    coins: 1250,
    level: 8,
    xp: 340,
    xpToNext: 500,
    streak: 5,
  };

  const todaysTasks = [
    { id: 1, title: 'Clean your room', coins: 50, completed: false, priority: 'high' },
    { id: 2, title: 'Math homework', coins: 75, completed: true, priority: 'medium' },
    { id: 3, title: 'Walk the dog', coins: 25, completed: false, priority: 'low' },
  ];

  const familyActivity = [
    { id: 1, user: 'Emma', action: 'completed', task: 'Dishes', timeAgo: '2 min ago', avatar: 'E' },
    { id: 2, user: 'Alex', action: 'earned', task: '100 coins', timeAgo: '1 hour ago', avatar: 'A' },
  ];

  const achievements = [
    { id: 1, icon: '🏆', title: 'Task Master', description: '10 tasks in a row' },
    { id: 2, icon: '🔥', title: 'Hot Streak', description: '5 day streak' },
    { id: 3, icon: '⭐', title: 'Super Helper', description: 'Help family member' },
  ];

  return (
    <ScrollView className="flex-1 bg-background-primary">
      {/* Header with greeting and stats */}
      <View className="px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-neutral-800 font-display">
              Hi Emma! 👋
            </Text>
            <Text className="text-base text-neutral-500 mt-1">
              Ready to level up today?
            </Text>
          </View>
          <Avatar 
            size="large" 
            initials="E" 
            progress={userStats.xp / userStats.xpToNext * 100}
          />
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-primary-500">
              {userStats.coins}
            </Text>
            <Text className="text-sm text-neutral-500">Coins</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-secondary-500">
              {userStats.level}
            </Text>
            <Text className="text-sm text-neutral-500">Level</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-warning-500">
              {userStats.streak}
            </Text>
            <Text className="text-sm text-neutral-500">Day Streak</Text>
          </Card>
        </View>

        {/* XP Progress */}
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-semibold text-neutral-700">Level Progress</Text>
            <Text className="text-sm text-neutral-500">
              {userStats.xp}/{userStats.xpToNext} XP
            </Text>
          </View>
          <ProgressBar progress={(userStats.xp / userStats.xpToNext) * 100} variant="thick" />
        </Card>
      </View>

      {/* Featured Section */}
      <View className="px-4 mb-6">
        <Card className="bg-gradient-to-br from-primary-400 to-primary-600 p-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-2">
                🎯 Complete 3 more tasks
              </Text>
              <Text className="text-white/80 text-sm mb-4">
                Unlock the &quot;Task Champion&quot; badge and earn 100 bonus coins!
              </Text>
              <Button variant="ghost" size="sm" className="self-start">
                View Tasks
              </Button>
            </View>
            <Text className="text-6xl opacity-20">🏆</Text>
          </View>
        </Card>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          {[
            { title: 'Chores', icon: '🧹', color: 'bg-success-100' },
            { title: 'Homework', icon: '📚', color: 'bg-secondary-100' },
            { title: 'Exercise', icon: '🏃', color: 'bg-warning-100' },
            { title: 'Reading', icon: '📖', color: 'bg-primary-100' },
          ].map((category, index) => (
            <TouchableOpacity 
              key={index}
              className={cn(
                'flex-row items-center px-4 py-3 rounded-2xl',
                category.color
              )}
            >
              <Text className="text-xl mr-2">{category.icon}</Text>
              <Text className="font-medium text-neutral-700">{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today's Tasks */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">Today&apos;s Tasks</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">View all</Text>
          </TouchableOpacity>
        </View>
        
        <View className="gap-2">
          {todaysTasks.map((task) => (
            <Card key={task.id} variant="interactive">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className={cn(
                      'font-medium',
                      task.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'
                    )}>
                      {task.title}
                    </Text>
                    {task.priority === 'high' && (
                      <Badge variant="new" className="ml-2">
                        High
                      </Badge>
                    )}
                  </View>
                  <Text className="text-sm text-neutral-500">+{task.coins} coins</Text>
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

      {/* Recent Achievements */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">Recent Achievements</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">View all</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="w-32 items-center py-4">
              <Text className="text-2xl mb-2">{achievement.icon}</Text>
              <Text className="font-semibold text-xs text-center mb-1">
                {achievement.title}
              </Text>
              <Text className="text-xs text-neutral-500 text-center">
                {achievement.description}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </View>

      {/* Family Activity */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Family Activity</Text>
        
        <View className="gap-2">
          {familyActivity.map((activity) => (
            <Card key={activity.id}>
              <View className="flex-row items-center">
                <Avatar size="small" initials={activity.avatar} className="mr-3" />
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">
                    <Text className="font-semibold">{activity.user}</Text> {activity.action} {activity.task}
                  </Text>
                  <Text className="text-xs text-neutral-500">{activity.timeAgo}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
