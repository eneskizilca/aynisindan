import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ordersApi } from '../../services/api';
import { theme } from '../../theme/theme';

const CATEGORIES = [
  { value: '', label: 'Kategori seçin...' },
  { value: 'Marangozluk', label: 'Marangozluk (Ahşap)' },
  { value: 'Metal Isciligi', label: 'Metal İşçiliği' },
  { value: 'Seramik', label: 'Seramik / Cam' },
  { value: 'Tekstil', label: 'Tekstil / Dericilik' },
  { value: 'Takı', label: 'Takı' },
  { value: 'Diger', label: 'Diğer' },
];

export default function NewOrderScreen({ navigation, route }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');

  const [uploadMode, setUploadMode] = useState<'local' | 'url'>('local');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  useEffect(() => {
    if (route.params) {
      const { referenceImageUrl: paramUrl, title: paramTitle } = route.params;
      if (paramUrl) {
        setReferenceImageUrl(paramUrl);
        setUploadMode('url');
      }
      if (paramTitle) {
        setTitle(paramTitle);
      }
    }
  }, [route.params]);

  // Local image states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  // AI states
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState('');
  const [aiSketchUrl, setAiSketchUrl] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementStep, setEnhancementStep] = useState<'idle' | 'enhancing' | 'review' | 'done'>('idle');

  // General loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Focus states
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [isDimFocused, setIsDimFocused] = useState(false);
  const [isMatFocused, setIsMatFocused] = useState(false);
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handlePickImage = async (useCamera = false) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          useCamera ? 'Kamerayı açmak için izin vermelisiniz.' : 'Fotoğraflara erişmek için izin vermelisiniz.'
        );
        return;
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);

        const filename = asset.uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        setImageFile({
          uri: asset.uri,
          name: filename,
          type,
        });

        // Reset AI values if a new image is chosen
        setAiGeneratedImageUrl('');
        setAiSketchUrl('');
        setEnhancementStep('idle');
        setError('');
      }
    } catch (err) {
      console.error('Image picking error: ', err);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir sorun oluştu.');
    }
  };

  const handleEnhanceSketch = async () => {
    if (!imageFile) return;
    setError('');
    setIsEnhancing(true);
    setEnhancementStep('enhancing');

    try {
      const res = await ordersApi.enhanceSketch(
        imageFile.uri,
        imageFile.name,
        imageFile.type,
        category || 'Diger',
        dimensions || 'Belirtilmemis',
        material || 'Belirtilmemis'
      );
      setAiSketchUrl(res.data.sketchUrl);
      setAiGeneratedImageUrl(res.data.aiGeneratedUrl);
      setEnhancementStep('review');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Eskiz yapay zeka ile iyileştirilemedi.');
      setEnhancementStep('idle');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptAiImage = () => {
    setEnhancementStep('done');
  };

  const handleRejectAiImage = () => {
    setAiGeneratedImageUrl('');
    setAiSketchUrl('');
    setEnhancementStep('idle');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Lütfen başlık ve açıklama alanlarını doldurun.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let finalImageUrl = uploadMode === 'url' ? referenceImageUrl.trim() : undefined;

      // If local image is selected and not enhanced by AI, upload it
      if (uploadMode === 'local' && imageFile && !aiGeneratedImageUrl) {
        const uploadRes = await ordersApi.uploadSketch(imageFile.uri, imageFile.name, imageFile.type);
        finalImageUrl = uploadRes.data.url;
      }

      // If AI sketch was uploaded during enhancement, use it
      if (aiSketchUrl && !finalImageUrl) {
        finalImageUrl = aiSketchUrl;
      }

      await ordersApi.createOrder({
        title: title.trim(),
        description: description.trim(),
        referenceImageUrl: finalImageUrl || undefined,
        aiGeneratedImageUrl: aiGeneratedImageUrl || undefined,
      });

      navigation.navigate('CustomerHome');
    } catch (err: any) {
      console.error('Order submit error:', JSON.stringify(err?.response?.data, null, 2));
      const data = err?.response?.data;
      const msg =
        typeof data === 'string' ? data :
        data?.message || data?.error || 'Sipariş oluşturulamadı.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Sipariş</Text>
        <View style={styles.placeholderButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Özel Sipariş Oluştur</Text>
          <Text style={styles.subtitle}>
            Özel eserinizi tanımlayın, zanaatkârlar en iyi tekliflerini göndersin.
          </Text>

          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Sipariş Başlığı <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isTitleFocused && styles.inputActive]}
                placeholder="örn. Özel Ceviz Yemek Masası"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Detaylı Açıklama <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, isDescFocused && styles.inputActive]}
                placeholder="Ölçüler, malzemeler, yüzey işlemi ve özel isteklerinizi açıklayın..."
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                onFocus={() => setIsDescFocused(true)}
                onBlur={() => setIsDescFocused(false)}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    category ? styles.dropdownTextSelected : null,
                  ]}
                >
                  {CATEGORIES.find((c) => c.value === category)?.label || 'Kategori seçin...'}
                </Text>
                <Ionicons
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.dropdownItem,
                        category === cat.value && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setCategory(cat.value);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          category === cat.value && styles.dropdownItemTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Dimensions & Material row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Ölçüler</Text>
                <TextInput
                  style={[styles.input, isDimFocused && styles.inputActive]}
                  placeholder="örn. 120x80x75 cm"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={dimensions}
                  onChangeText={setDimensions}
                  onFocus={() => setIsDimFocused(true)}
                  onBlur={() => setIsDimFocused(false)}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Malzeme</Text>
                <TextInput
                  style={[styles.input, isMatFocused && styles.inputActive]}
                  placeholder="örn. Ceviz ağacı"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={material}
                  onChangeText={setMaterial}
                  onFocus={() => setIsMatFocused(true)}
                  onBlur={() => setIsMatFocused(false)}
                />
              </View>
            </View>

            {/* Reference Image */}
            <View style={styles.inputGroup}>
              <View style={styles.imageHeaderRow}>
                <Text style={styles.label}>Referans Görsel (İsteğe Bağlı)</Text>
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, uploadMode === 'local' && styles.tabButtonActive]}
                    onPress={() => setUploadMode('local')}
                  >
                    <Ionicons name="cloud-upload-outline" size={14} color={uploadMode === 'local' ? theme.colors.textDark : theme.colors.textSecondary} />
                    <Text style={[styles.tabText, uploadMode === 'local' && styles.tabTextActive]}>Yükle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, uploadMode === 'url' && styles.tabButtonActive]}
                    onPress={() => setUploadMode('url')}
                  >
                    <Ionicons name="link-outline" size={14} color={uploadMode === 'url' ? theme.colors.textDark : theme.colors.textSecondary} />
                    <Text style={[styles.tabText, uploadMode === 'url' && styles.tabTextActive]}>Link</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {uploadMode === 'url' ? (
                <View style={styles.urlInputWrapper}>
                  <Ionicons name="link-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.urlInput, isUrlFocused && styles.inputActive]}
                    placeholder="https://ornek.com/gorsel.jpg"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={referenceImageUrl}
                    onChangeText={setReferenceImageUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                    onFocus={() => setIsUrlFocused(true)}
                    onBlur={() => setIsUrlFocused(false)}
                  />
                </View>
              ) : (
                <View style={styles.imagePickerCard}>
                  {/* Idle Upload Block */}
                  {!imageUri && enhancementStep === 'idle' && (
                    <View style={styles.uploadButtonsContainer}>
                      <Ionicons name="cloud-upload" size={40} color={theme.colors.primary} />
                      <Text style={styles.uploadHint}>Eskiz veya referans fotoğraf seçin</Text>
                      <View style={styles.pickerButtonRow}>
                        <TouchableOpacity style={styles.pickerButton} onPress={() => handlePickImage(false)}>
                          <Ionicons name="images-outline" size={16} color="#fff" />
                          <Text style={styles.pickerButtonText}>Galeriden Seç</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.pickerButton, { backgroundColor: theme.colors.textMuted }]} onPress={() => handlePickImage(true)}>
                          <Ionicons name="camera-outline" size={16} color="#fff" />
                          <Text style={styles.pickerButtonText}>Fotoğraf Çek</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Image Preview & AI Enhance block */}
                  {imageUri && enhancementStep === 'idle' && (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: imageUri }} style={styles.previewImage} />
                      <View style={styles.previewActionRow}>
                        <TouchableOpacity
                          style={styles.previewActionButton}
                          onPress={() => {
                            setImageUri(null);
                            setImageFile(null);
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                          <Text style={styles.previewActionText}>Görseli Sil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.previewActionButton, styles.enhanceButton]}
                          onPress={handleEnhanceSketch}
                        >
                          <Ionicons name="sparkles" size={16} color="#fff" />
                          <Text style={[styles.previewActionText, { color: '#fff' }]}>Eskizi İyileştir (AI)</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* AI Loading Block */}
                  {enhancementStep === 'enhancing' && (
                    <View style={styles.aiLoadingContainer}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={styles.aiLoadingTitle}>Eskiziniz işleniyor...</Text>
                      <Text style={styles.aiLoadingDesc}>Zanaatkârlarımız için yapay zeka ile referans görsel hazırlanıyor.</Text>
                    </View>
                  )}

                  {/* AI Comparison Block */}
                  {enhancementStep === 'review' && aiGeneratedImageUrl && (
                    <View style={styles.comparisonContainer}>
                      <Text style={styles.comparisonTitle}>Tasarımınız buna benziyor mu?</Text>
                      <View style={styles.comparisonRow}>
                        <View style={styles.comparisonBox}>
                          <Text style={styles.comparisonLabel}>Orijinal Eskiz</Text>
                          {imageUri && <Image source={{ uri: imageUri }} style={styles.comparisonImage} />}
                        </View>
                        <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} style={{ alignSelf: 'center' }} />
                        <View style={styles.comparisonBox}>
                          <Text style={styles.comparisonLabel}>AI Referans</Text>
                          <Image source={{ uri: aiGeneratedImageUrl }} style={[styles.comparisonImage, styles.comparisonImageActive]} />
                        </View>
                      </View>

                      <View style={styles.comparisonActionRow}>
                        <TouchableOpacity style={styles.rejectButton} onPress={handleRejectAiImage}>
                          <Ionicons name="close-circle-outline" size={16} color={theme.colors.error} />
                          <Text style={styles.rejectButtonText}>Vazgeç</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptAiImage}>
                          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                          <Text style={styles.acceptButtonText}>Onayla, Kullan</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* AI Done Block */}
                  {enhancementStep === 'done' && aiGeneratedImageUrl && (
                    <View style={styles.previewContainer}>
                      <View style={styles.aiDoneBadge}>
                        <Ionicons name="sparkles" size={12} color="#fff" />
                        <Text style={styles.aiDoneBadgeText}>AI Desteğiyle İyileştirildi</Text>
                      </View>
                      <Image source={{ uri: aiGeneratedImageUrl }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={() => {
                          setAiGeneratedImageUrl('');
                          setAiSketchUrl('');
                          setEnhancementStep('idle');
                        }}
                      >
                        <Text style={styles.changeImageButtonText}>Görseli Değiştir</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || (!!imageUri && enhancementStep === 'enhancing')}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Sipariş Talebini Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  placeholderButton: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: 100,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
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
  required: {
    color: theme.colors.error,
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
  textArea: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 120,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  dropdownButtonText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  dropdownTextSelected: {
    color: theme.colors.textDark,
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    marginTop: 2,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f5f4',
  },
  dropdownItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textDark,
  },
  dropdownItemTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  imageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2ded9',
    borderRadius: theme.borderRadius.sm,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeights.bold,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#fff',
    height: 48,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  urlInput: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: theme.typography.fontSizes.md,
    height: '100%',
  },
  imagePickerCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ddc0b9',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#fff',
    minHeight: 180,
    justifyContent: 'center',
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  uploadButtonsContainer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  uploadHint: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  pickerButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 6,
  },
  pickerButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  previewContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    resizeMode: 'cover',
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  previewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
    backgroundColor: '#fff',
  },
  previewActionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  enhanceButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  aiLoadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  aiLoadingTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
    marginTop: theme.spacing.sm,
  },
  aiLoadingDesc: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  comparisonContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  comparisonTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textDark,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  comparisonBox: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  comparisonLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  comparisonImage: {
    width: 110,
    height: 110,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    resizeMode: 'cover',
  },
  comparisonImageActive: {
    borderColor: theme.colors.primary,
  },
  comparisonActionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.errorBg,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  rejectButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  aiDoneBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    gap: 4,
  },
  aiDoneBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: theme.typography.fontWeights.bold,
  },
  changeImageButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  changeImageButtonText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeights.semibold,
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
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  submitButton: {
    flex: 1.5,
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
});
