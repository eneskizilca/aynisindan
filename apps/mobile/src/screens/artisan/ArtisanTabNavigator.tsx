import React, { createContext, useState, useCallback } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';
import SideMenu from '../../components/SideMenu';

import ArtisanFeedScreen from './ArtisanFeedScreen';
import ArtisanWorkspaceScreen from './ArtisanWorkspaceScreen';
import MessagesScreen from '../customer/MessagesScreen';

const Tab = createBottomTabNavigator();

interface SideMenuContextType {
  toggleMenu: () => void;
}

export const SideMenuContext = createContext<SideMenuContextType>({
  toggleMenu: () => {},
});

export default function ArtisanTabHome() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(
    (route: string) => {
      navigation.navigate(route);
    },
    [navigation]
  );

  const handleLogout = useCallback(() => {
    setMenuVisible(false);
    logout();
  }, [logout]);

  return (
    <SideMenuContext.Provider value={{ toggleMenu }}>
      <View style={styles.container}>
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
              let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
              if (route.name === 'FeedTab') {
                iconName = focused ? 'briefcase' : 'briefcase-outline';
              } else if (route.name === 'WorkspaceTab') {
                iconName = focused ? 'construct' : 'construct-outline';
              } else if (route.name === 'MessagesTab') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              }
              return <Ionicons name={iconName} size={20} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="FeedTab"
            component={ArtisanFeedScreen}
            options={{ tabBarLabel: 'İş Fırsatları' }}
          />
          <Tab.Screen
            name="WorkspaceTab"
            component={ArtisanWorkspaceScreen}
            options={{ tabBarLabel: 'Atölyem' }}
          />
          <Tab.Screen
            name="MessagesTab"
            component={MessagesScreen}
            options={{ tabBarLabel: 'Mesajlar' }}
          />
        </Tab.Navigator>

        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onNavigate={handleNavigate}
          userName={user?.fullName}
          onLogout={handleLogout}
        />
      </View>
    </SideMenuContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
