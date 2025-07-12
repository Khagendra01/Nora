import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Bell, Music, Heart, Search, Settings } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  isRead?: boolean;
}

function NotificationItem({ icon, title, description, time, isRead = false }: NotificationItemProps) {
  return (
    <TouchableOpacity style={[styles.notificationCard, !isRead && styles.unread]} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
        <Text style={styles.notificationTime}>{time}</Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const mockNotifications = [
    {
      icon: <Music size={20} color="#0C121E" />,
      title: 'New Release',
      description: 'Your favorite artist just released a new album',
      time: '2 hours ago',
      isRead: false,
    },
    {
      icon: <Heart size={20} color="#FF3B30" />,
      title: 'Weekly Favorites',
      description: 'Check out your most played tracks this week',
      time: '1 day ago',
      isRead: true,
    },
    {
      icon: <Search size={20} color="#0C121E" />,
      title: 'Trending Music',
      description: 'Discover what\'s trending in your region',
      time: '3 days ago',
      isRead: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#0C121E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          
          {mockNotifications.map((notification, index) => (
            <Animated.View key={index} entering={FadeInUp.delay(200 + index * 100)}>
              <NotificationItem {...notification} />
            </Animated.View>
          ))}
        </Animated.View>


        <View style={styles.footer}>
          <Text style={styles.footerText}>You're all caught up!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C121E',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C121E',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unread: {
    backgroundColor: '#F8F9FF',
    borderColor: '#E8EBFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C121E',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0C121E',
    marginTop: 8,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C121E',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
  },
});