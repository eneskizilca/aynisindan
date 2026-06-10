import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme/theme';

type Role = 'CUSTOMER' | 'ARTISAN';

export default function RegisterScreen({ navigation }: any) {
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register({ fullName, email, password, role });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Kayıt başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="basket-outline" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.logoText}>Aynısından</Text>
            <Text style={styles.logoSub}>Zanaatkarlar & Müşteriler</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Geleneksel el sanatlarının güvenli ağına katılın.
            </Text>

            <View style={styles.form}>
              {/* Role Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kayıt Türünü Seçin</Text>
                <View style={styles.rolePickerContainer}>
                  {/* Customer Button */}
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'CUSTOMER' && styles.roleButtonActive,
                    ]}
                    onPress={() => {
                      setRole('CUSTOMER');
                      if (error) setError('');
                    }}
                    activeOpacity={0.8}
                  >
                    {role === 'CUSTOMER' && (
                      <View style={styles.checkedBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                    <Ionicons
                      name="cart-outline"
                      size={28}
                      color={
                        role === 'CUSTOMER'
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'CUSTOMER' && styles.roleButtonTextActive,
                      ]}
                    >
                      Müşteri
                    </Text>
                  </TouchableOpacity>

                  {/* Artisan Button */}
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      role === 'ARTISAN' && styles.roleButtonActive,
                    ]}
                    onPress={() => {
                      setRole('ARTISAN');
                      if (error) setError('');
                    }}
                    activeOpacity={0.8}
                  >
                    {role === 'ARTISAN' && (
                      <View style={styles.checkedBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                    <Ionicons
                      name="hammer-outline"
                      size={28}
                      color={
                        role === 'ARTISAN'
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'ARTISAN' && styles.roleButtonTextActive,
                      ]}
                    >
                      Zanaatkâr
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad Soyad</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isNameFocused && styles.inputWrapperActive,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ahmet Yılmaz"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (error) setError('');
                    }}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta Adresi</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isEmailFocused && styles.inputWrapperActive,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="ahmet@ornek.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isPasswordFocused && styles.inputWrapperActive,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                    secureTextEntry={!showPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hintText}>En az 8 karakter olmalıdır.</Text>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Hesap Oluştur</Text>
                )}
              </TouchableOpacity>

              {/* Escrow Banner */}
              <View style={styles.escrowBanner}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.escrowText}>Param-Güvende Garantisi</Text>
              </View>
            </View>
          </View>

          {/* Bottom Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  logoText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  logoSub: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textDark,
  },
  rolePickerContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: 4,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    paddingVertical: theme.spacing.lg,
    position: 'relative',
    gap: theme.spacing.sm,
  },
  roleButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  checkedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textMuted,
  },
  roleButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  inputWrapperActive: {
    borderColor: theme.colors.borderActive,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  hintText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: theme.colors.errorBg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  escrowText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
  },
  footerLink: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  },
});
