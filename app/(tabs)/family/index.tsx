import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card, Badge, Avatar, GradientButton } from '@/components/ui';

export default function FamilyScreen() {
  // Mock family data
  const familyMembers = [
    { id: 1, name: 'Mom (Sarah)', role: 'Parent', avatar: 'S', status: 'online', tasksCompleted: 15, coins: 0 },
    { id: 2, name: 'Emma', role: 'Child', avatar: 'E', status: 'online', tasksCompleted: 8, coins: 1250 },
    { id: 3, name: 'Alex', role: 'Child', avatar: 'A', status: 'offline', tasksCompleted: 5, coins: 850 },
    { id: 4, name: 'Dad (Mike)', role: 'Parent', avatar: 'M', status: 'online', tasksCompleted: 12, coins: 0 },
  ];

  const familyStats = {
    totalTasks: 40,
    completedToday: 8,
    totalCoins: 2100,
    activeStreak: 12,
  };

  return (
    <ScrollView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-3xl font-bold text-neutral-800 font-display mb-2">
          Smith Family 👨‍👩‍👧‍👦
        </Text>
        <Text className="text-base text-neutral-500">
          {familyMembers.length} members • {familyStats.activeStreak} day streak
        </Text>
      </View>

      {/* Family Stats */}
      <View className="px-4 mb-6">
        <View className="flex-row gap-2">
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-primary-500">
              {familyStats.totalTasks}
            </Text>
            <Text className="text-xs text-neutral-500">Total Tasks</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-success-500">
              {familyStats.completedToday}
            </Text>
            <Text className="text-xs text-neutral-500">Today</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-warning-500">
              {familyStats.totalCoins}
            </Text>
            <Text className="text-xs text-neutral-500">Total Coins</Text>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</Text>
        <View className="flex-row gap-3">
          <GradientButton variant="primary" className="flex-1 shadow-lg">
            Invite Member
          </GradientButton>
          <GradientButton variant="secondary" className="flex-1 shadow-lg">
            Family Settings
          </GradientButton>
        </View>
      </View>

      {/* Family Members */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">Family Members</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">Manage</Text>
          </TouchableOpacity>
        </View>
        
        <View className="gap-2">
          {familyMembers.map((member) => (
            <Card key={member.id} variant="interactive">
              <View className="flex-row items-center">
                <Avatar size="medium" initials={member.avatar} className="mr-4" />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-neutral-700 mr-2">
                      {member.name}
                    </Text>
                    <Badge variant={member.role === 'Parent' ? 'premium' : 'free'}>
                      {member.role}
                    </Badge>
                    {member.status === 'online' && (
                      <View className="w-2 h-2 bg-success-500 rounded-full ml-2" />
                    )}
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-neutral-500 mr-4">
                      {member.tasksCompleted} tasks completed
                    </Text>
                    {member.coins > 0 && (
                      <Text className="text-sm text-primary-500 font-medium">
                        {member.coins} coins
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity className="px-3 py-1">
                  <Text className="text-primary-500 text-sm">View</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Family Achievements */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Family Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {[
            { icon: '🏆', title: 'Team Player', description: 'All members active today' },
            { icon: '🔥', title: 'Family Streak', description: '12 days strong!' },
            { icon: '⭐', title: 'Goal Crushers', description: 'Weekly goal achieved' },
            { icon: '🎯', title: 'Task Masters', description: '100+ tasks completed' },
          ].map((achievement, index) => (
            <Card key={index} className="w-32 items-center py-4">
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

      {/* Recent Activity */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Recent Family Activity</Text>
        
        <View className="gap-2">
          {[
            { user: 'Emma', action: 'completed', task: 'Math homework', timeAgo: '5 min ago', avatar: 'E' },
            { user: 'Alex', action: 'started', task: 'Clean room', timeAgo: '15 min ago', avatar: 'A' },
            { user: 'Mom', action: 'created', task: 'Grocery shopping', timeAgo: '1 hour ago', avatar: 'S' },
            { user: 'Dad', action: 'approved', task: 'Emma\'s homework', timeAgo: '2 hours ago', avatar: 'M' },
          ].map((activity, index) => (
            <Card key={index}>
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
