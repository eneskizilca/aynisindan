import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.7;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'document-text-outline', label: 'Tekliflerim', route: 'ArtisanQuotes' },
  { icon: 'images-outline', label: 'Portfolyo', route: 'ArtisanPortfolio' },
  { icon: 'wallet-outline', label: 'Cüzdan', route: 'ArtisanWallet' },
  { icon: 'settings-outline', label: 'Ayarlar', route: 'ArtisanSettings' },
];

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  userName?: string;
  onLogout: () => void;
}

export default function SideMenu({ visible, onClose, onNavigate, userName, onLogout }: SideMenuProps) {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.menu,
          {
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 16,
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={styles.menuUserRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.menuUserInfo}>
              <Text style={styles.menuUserName} numberOfLines={1}>
                {userName || 'Zanaatkâr'}
              </Text>
              <View style={styles.roleBadgeSmall}>
                <Ionicons name="hammer-outline" size={10} color={theme.colors.primary} />
                <Text style={styles.roleBadgeSmallText}>Zanaatkâr</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItems}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.menuItem}
              onPress={() => {
                onNavigate(item.route);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color={theme.colors.textDark} />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuFooter}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  menuUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  roleBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeSmallText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuItems: {
    flex: 1,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  menuItemLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textDark,
  },
  menuFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  logoutText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeights.medium,
  },
});
