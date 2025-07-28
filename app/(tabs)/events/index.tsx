import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { cn } from '@/utils/cn';

export default function EventsScreen() {
  // Mock events data
  const upcomingEvents = [
    {
      id: 1,
      title: 'Family Game Night',
      date: 'Today',
      time: '7:00 PM',
      participants: ['E', 'A', 'S', 'M'],
      category: 'Family Fun',
      reward: 25,
      status: 'confirmed'
    },
    {
      id: 2,
      title: 'Alex\'s Soccer Game',
      date: 'Tomorrow',
      time: '3:00 PM',
      participants: ['A', 'S', 'M'],
      category: 'Sports',
      reward: 50,
      status: 'confirmed'
    },
    {
      id: 3,
      title: 'Family Movie Night',
      date: 'Friday',
      time: '8:00 PM',
      participants: ['E', 'A', 'S', 'M'],
      category: 'Entertainment',
      reward: 30,
      status: 'pending'
    },
  ];

  const pastEvents = [
    {
      id: 4,
      title: 'Zoo Visit',
      date: 'Last Weekend',
      participants: ['E', 'A', 'S', 'M'],
      category: 'Adventure',
      completed: true,
      photos: 12
    },
    {
      id: 5,
      title: 'Emma\'s Piano Recital',
      date: '2 weeks ago',
      participants: ['E', 'S', 'M'],
      category: 'Achievement',
      completed: true,
      photos: 8
    },
  ];

  const eventStats = {
    thisMonth: 8,
    completed: 5,
    upcoming: 3,
    totalRewards: 180,
  };

  return (
    <ScrollView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-neutral-800 font-display">
              Family Events 📅
            </Text>
            <Text className="text-base text-neutral-500">
              {eventStats.upcoming} upcoming • {eventStats.completed} completed this month
            </Text>
          </View>
          <Button variant="primary" size="sm">
            Create Event
          </Button>
        </View>
      </View>

      {/* Event Stats */}
      <View className="px-4 mb-6">
        <View className="flex-row gap-2">
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-primary-500">
              {eventStats.thisMonth}
            </Text>
            <Text className="text-xs text-neutral-500">This Month</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-success-500">
              {eventStats.completed}
            </Text>
            <Text className="text-xs text-neutral-500">Completed</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1 items-center py-4">
            <Text className="text-xl font-bold text-warning-500">
              {eventStats.totalRewards}
            </Text>
            <Text className="text-xs text-neutral-500">Total Coins</Text>
          </Card>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {[
            { title: 'Game Night', icon: '🎮', color: 'bg-primary-100' },
            { title: 'Outdoor Fun', icon: '🌳', color: 'bg-success-100' },
            { title: 'Movie Night', icon: '🎬', color: 'bg-secondary-100' },
            { title: 'Learning', icon: '📚', color: 'bg-warning-100' },
            { title: 'Sports', icon: '⚽', color: 'bg-error-100' },
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
        </ScrollView>
      </View>

      {/* This Week's Events */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">This Week&apos;s Events</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">View Calendar</Text>
          </TouchableOpacity>
        </View>
        
        <View className="gap-2">
          {upcomingEvents.map((event) => (
            <Card key={event.id} variant="interactive">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-semibold text-neutral-700 mr-2">
                      {event.title}
                    </Text>
                    <Badge variant={event.status === 'confirmed' ? 'premium' : 'free'}>
                      {event.category}
                    </Badge>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-neutral-500 mr-4">
                      {event.date} at {event.time}
                    </Text>
                    <Text className="text-sm text-primary-500 font-medium">
                      +{event.reward} coins
                    </Text>
                  </View>
                </View>
                
                <Badge variant={event.status === 'confirmed' ? 'new' : 'free'}>
                  {event.status}
                </Badge>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="text-sm text-neutral-500 mr-2">Participants:</Text>
                  <View className="flex-row">
                    {event.participants.map((participant, index) => (
                      <Avatar 
                        key={index}
                        size="small" 
                        initials={participant} 
                        className={cn('mr-1', index > 0 && '-ml-2')}
                      />
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity className="px-3 py-1">
                  <Text className="text-primary-500 text-sm">View Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Featured Event */}
      <View className="px-4 mb-6">
        <Card className="bg-gradient-to-br from-secondary-400 to-secondary-600 p-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-2">
                🎉 Plan a Family Adventure
              </Text>
              <Text className="text-white/80 text-sm mb-4">
                Create a special family event and earn bonus rewards for everyone!
              </Text>
              <Button variant="ghost" size="sm" className="self-start">
                Start Planning
              </Button>
            </View>
            <Text className="text-6xl opacity-20">🗓️</Text>
          </View>
        </Card>
      </View>

      {/* Recent Events */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-neutral-800">Recent Events</Text>
          <TouchableOpacity>
            <Text className="text-primary-500 font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        
        <View className="gap-2">
          {pastEvents.map((event) => (
            <Card key={event.id}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <Text className="font-semibold text-neutral-700 mr-2 flex-1">
                      {event.title}
                    </Text>
                    <Badge variant="premium">
                      {event.category}
                    </Badge>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Text className="text-sm text-neutral-500 mr-4">
                      {event.date}
                    </Text>
                    <Text className="text-sm text-success-500 font-medium">
                      ✓ Completed • {event.photos} photos
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-sm text-neutral-500 mr-2">Participants:</Text>
                      <View className="flex-row">
                        {event.participants.map((participant, index) => (
                          <Avatar 
                            key={index}
                            size="small" 
                            initials={participant} 
                            className={cn(index > 0 ? '-ml-1 mr-0' : 'mr-0')}
                          />
                        ))}
                      </View>
                    </View>
                    <TouchableOpacity className="px-3 py-1">
                      <Text className="text-primary-500 text-sm">View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Event Categories */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">Event Categories</Text>
        <View className="gap-3">
          {[
            { title: 'Family Adventures', icon: '🌟', count: 5, color: 'bg-primary-50 border-primary-200' },
            { title: 'Educational Events', icon: '📚', count: 3, color: 'bg-secondary-50 border-secondary-200' },
            { title: 'Sports & Activities', icon: '⚽', count: 4, color: 'bg-success-50 border-success-200' },
            { title: 'Celebrations', icon: '🎉', count: 2, color: 'bg-warning-50 border-warning-200' },
          ].map((category, index) => (
            <TouchableOpacity key={index}>
              <Card className={cn('border', category.color)}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{category.icon}</Text>
                    <View>
                      <Text className="font-semibold text-neutral-700">
                        {category.title}
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        {category.count} events this month
                      </Text>
                    </View>
                  </View>
                  <Text className="text-primary-500 text-sm">Browse →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
