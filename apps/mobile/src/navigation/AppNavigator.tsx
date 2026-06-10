import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer Screens
import CustomerOrdersScreen from '../screens/customer/CustomerOrdersScreen';
import NewOrderScreen from '../screens/customer/NewOrderScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import InspireScreen from '../screens/customer/InspireScreen';
import MessagesScreen from '../screens/customer/MessagesScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ChatScreen from '../screens/customer/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Nested Customer Stack Navigator for Orders Flow
function CustomerOrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerOrdersList" component={CustomerOrdersScreen} />
      <Stack.Screen name="NewOrder" component={NewOrderScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}

// 5-Tab Customer Bottom Tab Navigator
function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          if (route.name === 'OrdersTab') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'ExploreTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'InspireTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'MessagesTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="OrdersTab"
        component={CustomerOrdersStack}
        options={{ tabBarLabel: 'Siparişlerim' }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Keşfet' }}
      />
      <Tab.Screen
        name="InspireTab"
        component={InspireScreen}
        options={{ tabBarLabel: 'İlham Al' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Mesajlar' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Placeholder Artisan Dashboard Screen
function ArtisanDashboard() {
  const { user, logout } = useAuth();
  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Merhaba,</Text>
          <Text style={styles.nameText}>{user?.fullName || 'Zanaatkâr'}</Text>
        </View>
        <View style={styles.roleBadge}>
          <Ionicons name="hammer-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.roleBadgeText}>Zanaatkâr</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="hammer-outline" size={40} color={theme.colors.primary} style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Zanaatkâr Paneli</Text>
          <Text style={styles.cardDescription}>
            Aynısından Zanaatkâr Paneline başarıyla giriş yaptınız. Çok yakında işlerinizi, portfolyonuzu ve tekliflerinizi buradan yönetebileceksiniz.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicatorWrapper />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Flow Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App Flow based on Role
        <>
          {user?.role === 'ARTISAN' ? (
            // Artisan Flow
            <Stack.Screen name="ArtisanHome" component={ArtisanDashboard} />
          ) : (
            // Customer Bottom Tab Navigator Flow
            <Stack.Screen name="CustomerTabHome" component={CustomerTabNavigator} />
          )}
          <Stack.Screen name="ChatDetail" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Simple loader wrapper for native styling ease
function ActivityIndicatorWrapper() {
  return (
    <View style={{ alignItems: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textDark }}>
        Aynısından
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  nameText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardIcon: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoutText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});
