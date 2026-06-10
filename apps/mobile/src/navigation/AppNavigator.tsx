import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, Dimensions } from 'react-native';
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
import ArtisanTabHome from '../screens/artisan/ArtisanTabNavigator';
import ArtisanQuotesScreen from '../screens/artisan/ArtisanQuotesScreen';
import ArtisanPortfolioScreen from '../screens/artisan/ArtisanPortfolioScreen';
import ArtisanWalletScreen from '../screens/artisan/ArtisanWalletScreen';
import ArtisanSettingsScreen from '../screens/artisan/ArtisanSettingsScreen';
import ArtisanOrderDetailScreen from '../screens/artisan/ArtisanOrderDetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          backgroundColor: '#fff',
          borderRadius: 30,
          height: 64,
          borderTopWidth: 0,
          shadowColor: '#231916',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
          paddingBottom: Platform.OS === 'ios' ? 6 : 0,
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
            <Stack.Screen name="ArtisanHome" component={ArtisanTabHome} />
          ) : (
            // Customer Bottom Tab Navigator Flow
            <Stack.Screen name="CustomerTabHome" component={CustomerTabNavigator} />
          )}
          {user?.role === 'ARTISAN' && (
            <>
              <Stack.Screen name="ArtisanQuotes" component={ArtisanQuotesScreen} />
              <Stack.Screen name="ArtisanPortfolio" component={ArtisanPortfolioScreen} />
              <Stack.Screen name="ArtisanWallet" component={ArtisanWalletScreen} />
              <Stack.Screen name="ArtisanSettings" component={ArtisanSettingsScreen} />
              <Stack.Screen name="OrderDetail" component={ArtisanOrderDetailScreen} />
            </>
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

});
