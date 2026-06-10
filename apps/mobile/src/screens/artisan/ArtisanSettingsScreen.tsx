import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

export default function ArtisanSettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');

  const handleSave = () => {
    Alert.alert('Bilgi', 'Profil güncelleme henüz aktif değil.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.pageSub}>Profil ve hesap bilgilerinizi yönetin.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profil Bilgileri</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleDisplay}>
              <Ionicons name="hammer-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.roleText}>Zanaatkâr</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  pageSub: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  fieldGroup: {
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
  inputDisabled: {
    backgroundColor: '#f9f5f4',
    color: theme.colors.textMuted,
  },
  roleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  roleText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});
