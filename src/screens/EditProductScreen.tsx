import React, { useState, useMemo } from 'react';
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
import { useTheme } from '../hooks/useTheme';

const EditProductScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch<AppDispatch>();
  const { product } = route.params || {};
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    listPrice: product?.listPrice?.toString() || '',
    category: product?.mainCategory || product?.category || 'Toys & Games',
    image: product?.image || '',
    stock: product?.stock?.toString() || '10',
    sku: product?.sku || '',
    brand: product?.brand || '',
    manufacturer: product?.manufacturer || '',
    subCategory: product?.subCategory || '',
    productType: product?.productType || '',
    minimumAge: product?.minimumAge?.toString() || '',
    countryOfOrigin: product?.countryOfOrigin || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const requiredFields = ['name', 'price', 'listPrice', 'category', 'subCategory', 'image', 'sku', 'brand', 'productType', 'minimumAge', 'countryOfOrigin'];
    const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);

    if (missingFields.length > 0) {
      showToast('Please fill in all required fields (*)', 'error');
      return;
    }

    setLoading(true);
    try {
      let resultAction;
      const submissionData = {
        ...formData,
        mainCategory: formData.category,
        price: Number(formData.price),
        listPrice: Number(formData.listPrice),
        stock: Number(formData.stock),
        minimumAge: Number(formData.minimumAge),
      };

      if (isEditing) {
        resultAction = await dispatch(updateProduct({ id: product.id || product._id, productData: submissionData }));
      } else {
        resultAction = await dispatch(addProduct(submissionData));
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
        placeholderTextColor={colors.gray}
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
          <Icon name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderInput('Product Name *', 'name', 'e.g. Lego Star Wars')}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            {renderInput('SKU *', 'sku', 'e.g. LEGO-123')}
          </View>
          <View style={{ width: '48%' }}>
            {renderInput('Brand *', 'brand', 'e.g. LEGO')}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            {renderInput('Main Category *', 'category', 'e.g. Toys')}
          </View>
          <View style={{ width: '48%' }}>
            {renderInput('Sub Category', 'subCategory', 'e.g. Building Sets')}
          </View>
        </View>

        {renderInput('Product Type *', 'productType', 'e.g. Construction Toy')}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            {renderInput('Price (₹) *', 'price', 'e.g. 1299', 'numeric')}
          </View>
          <View style={{ width: '48%' }}>
            {renderInput('List Price (MRP) *', 'listPrice', 'e.g. 1999', 'numeric')}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            {renderInput('Stock *', 'stock', 'e.g. 50', 'numeric')}
          </View>
          <View style={{ width: '48%' }}>
            {renderInput('Min Age (Months) *', 'minimumAge', 'e.g. 36', 'numeric')}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            {renderInput('Manufacturer *', 'manufacturer', 'e.g. The LEGO Group')}
          </View>
          <View style={{ width: '48%' }}>
            {renderInput('Country *', 'countryOfOrigin', 'e.g. Denmark')}
          </View>
        </View>

        {renderInput('Image URL *', 'image', 'https://example.com/image.jpg')}
        {renderInput('Description', 'description', 'Write something about the toy...', 'default', true)}

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>{isEditing ? 'Update Product' : 'Create Product'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  inputContainer: {
    marginBottom: moderateScale(15),
  },
  label: {
    ...FONTS.body,
    fontWeight: '700',
    marginBottom: moderateScale(6),
    color: colors.text,
    fontSize: moderateScale(13),
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: moderateScale(15),
    height: moderateScale(50),
    color: colors.text,
    ...FONTS.body,
    ...SHADOWS.light,
  },
  textArea: {
    height: moderateScale(100),
    paddingTop: moderateScale(12),
  },
  saveBtn: {
    backgroundColor: colors.primary,
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
    color: '#FFFFFF',
    fontSize: moderateScale(16),
  }
});

export default EditProductScreen;
