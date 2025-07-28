import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card, Button, Badge, Avatar, ProgressBar, GradientButton } from '@/components/ui';
import { cn } from '@/utils/cn';

export default function ProfileScreen() {
  // Mock user data
  const userProfile = {
    name: 'Emma Johnson',
    role: 'Child',
    level: 8,
    xp: 340,
    xpToNext: 500,
    coins: 1250,
    tasksCompleted: 45,
    streak: 5,
    joinedDate: 'March 2024',
    avatar: 'E',
  };

  const achievements = [
    { id: 1, icon: '🏆', title: 'Task Master', description: '10 tasks in a row', unlocked: true },
    { id: 2, icon: '🔥', title: 'Hot Streak', description: '5 day streak', unlocked: true },
    { id: 3, icon: '⭐', title: 'Super Helper', description: 'Help family member', unlocked: true },
    { id: 4, icon: '🎯', title: 'Goal Crusher', description: 'Complete weekly goal', unlocked: false },
    { id: 5, icon: '📚', title: 'Scholar', description: 'Homework streak', unlocked: false },
    { id: 6, icon: '🌟', title: 'Family Star', description: 'Top contributor', unlocked: false },
  ];

  const statsData = [
    { label: 'Tasks Completed', value: userProfile.tasksCompleted, icon: '✅', color: 'text-success-500' },
    { label: 'Current Streak', value: `${userProfile.streak} days`, icon: '🔥', color: 'text-warning-500' },
    { label: 'Total Coins', value: userProfile.coins, icon: '🪙', color: 'text-primary-500' },
    { label: 'Current Level', value: userProfile.level, icon: '⭐', color: 'text-secondary-500' },
  ];

  const settingsOptions = [
    { id: 1, title: 'Notifications', description: 'Manage your notification preferences', icon: '🔔' },
    { id: 2, title: 'Privacy', description: 'Control your privacy settings', icon: '🔒' },
    { id: 3, title: 'Theme', description: 'Choose your app appearance', icon: '🎨' },
    { id: 4, title: 'Language', description: 'Select your preferred language', icon: '🌍' },
    { id: 5, title: 'Help & Support', description: 'Get help and contact support', icon: '❓' },
    { id: 6, title: 'About', description: 'App version and information', icon: 'ℹ️' },
  ];

  return (
    <ScrollView className="flex-1 bg-background-primary">
      {/* Header with Profile Info */}
      <View className="px-4 pt-12 pb-6">
        <View className="items-center mb-6">
          <Avatar 
            size="large" 
            initials={userProfile.avatar} 
            progress={(userProfile.xp / userProfile.xpToNext) * 100}
            className="mb-4" 
          />
          <Text className="text-2xl font-bold text-neutral-800 font-display mb-1">
            {userProfile.name}
          </Text>
          <View className="flex-row items-center">
            <Badge variant="premium" className="mr-2">
              {userProfile.role}
            </Badge>
            <Text className="text-sm text-neutral-500">
              Level {userProfile.level} • Joined {userProfile.joinedDate}
            </Text>
          </View>
        </View>

        {/* XP Progress */}
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-semibold text-neutral-700">Level Progress</Text>
            <Text className="text-sm text-neutral-500">
              {userProfile.xp}/{userProfile.xpToNext} XP
            </Text>
          </View>
          <ProgressBar progress={(userProfile.xp / userProfile.xpToNext) * 100} variant="thick" />
          <Text className="text-xs text-neutral-500 mt-2">
            {userProfile.xpToNext - userProfile.xp} XP to next level
          </Text>
        </Card>
      </View>

      {/* User Stats */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Your Stats</Text>
        <View className="flex-row flex-wrap gap-2">
          {statsData.map((stat, index) => (
            <Card key={index} variant="elevated" className="flex-1 min-w-0 items-center py-4">
              <Text className="text-2xl mb-1">{stat.icon}</Text>
              <Text className={cn('text-lg font-bold', stat.color)}>
                {stat.value}
              </Text>
              <Text className="text-xs text-neutral-500 text-center">
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</Text>
        <View className="flex-row gap-3">
          <GradientButton variant="primary" className="flex-1 shadow-lg">
            Edit Profile
          </GradientButton>
          <GradientButton variant="secondary" className="flex-1 shadow-lg">
            View Rewards
          </GradientButton>
        </View>
      </View>

      {/* Achievements */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">Achievements</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row flex-wrap gap-2">
          {achievements.slice(0, 6).map((achievement) => (
            <View key={achievement.id} className="w-[48%]">
              <Card className={cn(
                'items-center py-3 px-2 min-h-[120px]',
                achievement.unlocked ? 'bg-white' : 'bg-neutral-50'
              )}>
                <Text className={cn(
                  'text-2xl mb-2',
                  !achievement.unlocked && 'opacity-30'
                )}>
                  {achievement.icon}
                </Text>
                <Text className={cn(
                  'font-semibold text-xs text-center mb-1',
                  achievement.unlocked ? 'text-neutral-700' : 'text-neutral-400'
                )}>
                  {achievement.title}
                </Text>
                <Text className={cn(
                  'text-xs text-center mb-2 flex-1',
                  achievement.unlocked ? 'text-neutral-500' : 'text-neutral-300'
                )}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <Badge variant="new" className="px-2 py-1">
                    Unlocked
                  </Badge>
                )}
              </Card>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Recent Activity</Text>
        <View className="gap-2">
          {[
            { action: 'Completed', task: 'Math homework', timeAgo: '2 hours ago', coins: 75 },
            { action: 'Earned', task: 'Hot Streak achievement', timeAgo: '1 day ago', coins: 50 },
            { action: 'Completed', task: 'Clean room', timeAgo: '2 days ago', coins: 50 },
          ].map((activity, index) => (
            <Card key={index}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">
                    <Text className="font-semibold">{activity.action}</Text> {activity.task}
                  </Text>
                  <Text className="text-xs text-neutral-500">{activity.timeAgo}</Text>
                </View>
                <Text className="text-sm text-primary-500 font-medium">
                  +{activity.coins} coins
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Settings</Text>
        <View className="gap-2">
          {settingsOptions.map((option) => (
            <TouchableOpacity key={option.id}>
              <Card variant="interactive">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-3">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-neutral-700">
                        {option.title}
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-neutral-400">›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <View className="px-4 mb-8">
        <Button variant="ghost" className="w-full">
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}
