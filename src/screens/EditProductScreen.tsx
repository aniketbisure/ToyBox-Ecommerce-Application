import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchProducts, addProduct, updateProduct } from '../redux/slices/productSlice';
import { AppDispatch } from '../redux/store';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { moderateScale } from '../utils/responsive';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../utils/toastService';

const EditProductScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { product } = route.params || {};
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    image: product?.image || '',
    stock: product?.stock?.toString() || '10',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      let resultAction;
      if (isEditing) {
        resultAction = await dispatch(updateProduct({ id: product.id || product._id, productData: formData }));
      } else {
        resultAction = await dispatch(addProduct(formData));
      }

      if (addProduct.fulfilled.match(resultAction) || updateProduct.fulfilled.match(resultAction)) {
        showToast(isEditing ? 'Product updated successfully' : 'Product added successfully', 'success');
        navigation.goBack();
      } else {
        showToast('Failed to save product', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, key: keyof typeof formData, placeholder: string, keyboardType: any = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        value={formData[key]}
        onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderInput('Product Name *', 'name', 'e.g. Lego Star Wars')}
        {renderInput('Category *', 'category', 'e.g. Educational')}
        {renderInput('Price (₹) *', 'price', 'e.g. 1299', 'numeric')}
        {renderInput('Stock Quantity', 'stock', 'e.g. 50', 'numeric')}
        {renderInput('Image URL *', 'image', 'https://example.com/image.jpg')}
        {renderInput('Description', 'description', 'Write something about the toy...', 'default', true)}

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>{isEditing ? 'Update Product' : 'Create Product'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(15),
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: moderateScale(20),
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  inputContainer: {
    marginBottom: moderateScale(20),
  },
  label: {
    ...FONTS.body,
    fontWeight: '700',
    marginBottom: moderateScale(8),
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: moderateScale(15),
    height: moderateScale(55),
    ...FONTS.body,
    ...SHADOWS.light,
  },
  textArea: {
    height: moderateScale(120),
    paddingTop: moderateScale(15),
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: moderateScale(55),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(10),
    ...SHADOWS.medium,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  saveBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
    fontSize: moderateScale(16),
  }
});

export default EditProductScreen;
