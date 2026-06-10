import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Focus states for visual feedback
  const [isNameFocused, setIsNameFocused] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Lütfen ad soyad alanını doldurun.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({ fullName: fullName.trim() });
      Alert.alert('Başarılı', 'Profil bilgileriniz başarıyla güncellendi.');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Profil bilgileri güncellenirken bir sorun oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Visual Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.nameHeader}>{user?.fullName || 'Müşteri'}</Text>
            <Text style={styles.emailHeader}>{user?.email || 'email@ornek.com'}</Text>
            
            <View style={styles.roleBadge}>
              <Ionicons name="person-circle-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.roleText}>Müşteri</Text>
            </View>
          </View>

          {/* Edit Profile Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Hesap Bilgileri</Text>
            
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={[styles.input, isNameFocused && styles.inputActive]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ad soyadınızı girin..."
                placeholderTextColor={theme.colors.textSecondary}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-posta (Değiştirilemez)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ''}
                editable={false}
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Role (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hesap Türü / Rol</Text>
              <View style={[styles.input, styles.inputDisabled, styles.disabledContainer]}>
                <Text style={styles.disabledText}>
                  {user?.role === 'ARTISAN' ? 'Zanaatkâr' : 'Müşteri'}
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Menu Items List */}
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />
                <Text style={styles.menuText}>Ödeme Yöntemlerim</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />
                <Text style={styles.menuText}>Adres Bilgilerim</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <Ionicons name="help-circle-outline" size={20} color={theme.colors.textMuted} />
                <Text style={styles.menuText}>Destek & Yardım</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    alignItems: 'center',
    paddingBottom: 48,
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nameHeader: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  emailHeader: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    gap: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  formTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
  },
  inputActive: {
    borderColor: theme.colors.borderActive,
  },
  inputDisabled: {
    backgroundColor: '#f5f0ee',
    borderColor: '#e9d6d1',
    color: theme.colors.textMuted,
  },
  disabledContainer: {
    justifyContent: 'center',
  },
  disabledText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSizes.md,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#ddc0b9',
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  menuContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f5f4',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  menuText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeights.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#991b1b', // Red-800 for negative/logout actions
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    shadowColor: '#991b1b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: theme.spacing.xs,
  },
  logoutText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});
