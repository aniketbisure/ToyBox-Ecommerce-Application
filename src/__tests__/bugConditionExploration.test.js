/**
 * Bug Condition Exploration Tests
 *
 * These tests inspect source files statically (via fs.readFileSync) to detect
 * the presence of confirmed bugs. Each test is EXPECTED TO FAIL on unfixed code
 * — failure = bug confirmed. Only unexpected passes indicate a problem.
 *
 * DO NOT fix source files to make these pass. Fixes happen in Phase 2.
 *
 * Validates: Requirements 1.3, 1.4, 1.14, 1.16, 1.20, 1.21, 1.28, 1.29,
 *            1.30, 1.31, 1.32, 1.33, 1.35, 1.36, 1.37, 1.38, 1.39, 1.40
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const SRC = path.join(ROOT, 'src');
const ADMIN_SRC = path.join(ROOT, 'admin', 'src', 'app', '(dashboard)');

function readSrc(relPath) {
  return fs.readFileSync(path.join(SRC, relPath), 'utf8');
}

function readAdmin(relPath) {
  return fs.readFileSync(path.join(ADMIN_SRC, relPath), 'utf8');
}

// ---------------------------------------------------------------------------
// Bug B — COLORS token undefined (isBugCondition_ColorsToken)
// EditProfileScreen uses COLORS.background / COLORS.text which are undefined
// on the COLORS object (they live on LIGHT_THEME / DARK_THEME).
// EXPECTED: FAIL — COLORS.background / COLORS.text are accessed directly.
// Requirements: 1.3, 1.4
// ---------------------------------------------------------------------------
describe('Bug B — COLORS token undefined (isBugCondition_ColorsToken)', () => {
  const UNDEFINED_TOKENS = ['background', 'text', 'gray', 'lightGray', 'card', 'textSecondary', 'border'];

  test('COLORS object does NOT contain theme-only tokens (background, text, gray…)', () => {
    const themeFile = readSrc('constants/theme.ts');

    // Extract the COLORS object literal between "export const COLORS = {" and the closing "};"
    const colorsMatch = themeFile.match(/export const COLORS\s*=\s*\{([^}]+)\}/s);
    expect(colorsMatch).not.toBeNull();
    const colorsBody = colorsMatch[1];

    // None of the theme-only tokens should appear as keys in COLORS
    for (const token of UNDEFINED_TOKENS) {
      const hasToken = new RegExp(`\\b${token}\\s*:`).test(colorsBody);
      // This assertion SHOULD PASS — confirms COLORS really lacks these tokens
      expect(hasToken).toBe(false);
    }
  });

  test('isBugCondition_ColorsToken — EditProfileScreen accesses COLORS.background or COLORS.text directly', () => {
    const source = readSrc('screens/EditProfileScreen.tsx');

    // BUG: direct COLORS.background / COLORS.text usage in StyleSheet
    const usesCOLORSBackground = source.includes('COLORS.background');
    const usesCOLORSText = source.includes('COLORS.text');

    // EXPECTED TO FAIL on buggy code: at least one of these is true
    // If BOTH are false, the bug is gone. On unfixed code, expect failure.
    expect(usesCOLORSBackground || usesCOLORSText).toBe(false);
    // ^ WILL FAIL — COLORS.background and COLORS.text ARE used in EditProfileScreen styles
  });

  test('isBugCondition_ColorsToken — EditProfileScreen uses useTheme() for all color tokens', () => {
    const source = readSrc('screens/EditProfileScreen.tsx');

    // EXPECTED FIX: should use useTheme() hook
    const usesUseTheme = source.includes('useTheme');
    // EXPECTED TO FAIL on unfixed code — EditProfileScreen does NOT import useTheme
    expect(usesUseTheme).toBe(true);
    // ^ WILL FAIL — EditProfileScreen has no useTheme() import/call
  });
});

// ---------------------------------------------------------------------------
// Bug E — Fake account deletion (isBugCondition_FakeDeleteAccount)
// handleDeleteAccount in SettingsScreen shows a toast without making an API call.
// EXPECTED: FAIL — no real API call to DELETE /users/profile is present.
// Requirements: 1.16
// ---------------------------------------------------------------------------
describe('Bug E — Fake account deletion (isBugCondition_FakeDeleteAccount)', () => {
  test('isBugCondition_FakeDeleteAccount — SettingsScreen handleDeleteAccount makes a real API delete call', () => {
    const source = readSrc('screens/SettingsScreen.tsx');

    // EXPECTED FIX: should call apiClient.delete or api.delete for account deletion
    const hasApiDeleteCall =
      source.includes('apiClient.delete') ||
      source.includes('api.delete(') ||
      source.includes(".delete('/users/profile'") ||
      source.includes('.delete("/users/profile"');

    // EXPECTED TO FAIL on unfixed code — only a toast fires, no API call
    expect(hasApiDeleteCall).toBe(true);
    // ^ WILL FAIL — SettingsScreen shows "Feature Not Available" alert with no API call
  });

  test('isBugCondition_FakeDeleteAccount — SettingsScreen does not stub-out delete with a "not available" alert', () => {
    const source = readSrc('screens/SettingsScreen.tsx');

    // BUG PATTERN: showing "Feature Not Available" instead of making the delete call
    const hasStubAlert = source.includes('Feature Not Available');

    // EXPECTED TO FAIL on buggy code — stub alert IS present
    expect(hasStubAlert).toBe(false);
    // ^ WILL FAIL — the fake/stub implementation is present
  });
});

// ---------------------------------------------------------------------------
// Bug G — Admin JWT client-side forgery (isBugCondition_AdminJwtClientSide)
// layout.tsx decodes JWT using atob() without signature verification.
// NOTE: Already fixed in current codebase — uses server-side verify via api.get.
// EXPECTED: This test will PASS (documents the fix is in place).
// Requirements: 1.20
// ---------------------------------------------------------------------------
describe('Bug G — Admin JWT client-side forgery (isBugCondition_AdminJwtClientSide)', () => {
  test('isBugCondition_AdminJwtClientSide — admin layout does NOT use atob() to decode JWT', () => {
    const source = readAdmin('layout.tsx');

    const usesAtob = source.includes('atob(');

    // Documents current state: atob is NOT present (already fixed via server-side check)
    expect(usesAtob).toBe(false);
  });

  test('isBugCondition_AdminJwtClientSide — admin layout uses server-side verification (api call present)', () => {
    const source = readAdmin('layout.tsx');

    const hasServerSideVerify =
      source.includes('api.get') ||
      source.includes('fetch(') ||
      source.includes('/auth/verify') ||
      source.includes('/users/profile');

    // Documents current state: server-side verify IS present
    expect(hasServerSideVerify).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug H — AdminBannersScreen delete uses item.id instead of item._id
// handleDeleteBanner should be called with item._id not item.id.
// NOTE: Already fixed in current codebase — uses item._id.
// Requirements: 1.21
// ---------------------------------------------------------------------------
describe('Bug H — AdminBannersScreen delete uses item.id instead of item._id', () => {
  test('isBugCondition_H — AdminBannersScreen handleDeleteBanner is NOT called with bare item.id', () => {
    const source = readSrc('screens/AdminBannersScreen.tsx');

    // BUG pattern: handleDeleteBanner(item.id) — plain item.id without underscore
    // We use a regex that matches item.id but NOT item._id
    const callsWithItemIdOnly = /handleDeleteBanner\(\s*item\.id\s*\)/.test(source);

    // On unfixed code: EXPECTED TO FAIL (item.id IS used)
    // On fixed code: PASSES (item._id is used instead)
    expect(callsWithItemIdOnly).toBe(false);
  });

  test('isBugCondition_H — AdminBannersScreen handleDeleteBanner IS called with item._id', () => {
    const source = readSrc('screens/AdminBannersScreen.tsx');

    const callsWithUnderscoreId = /handleDeleteBanner\(\s*item\._id\s*\)/.test(source);

    // Documents current state: item._id is used (already fixed)
    expect(callsWithUnderscoreId).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug J — Admin product edit 404
// admin/products/edit/[id]/page.tsx does not exist.
// NOTE: File EXISTS in current codebase — bug may already be fixed.
// Requirements: 1.29
// ---------------------------------------------------------------------------
describe('Bug J — Admin product edit 404', () => {
  test('Admin products/edit/[id]/page.tsx file exists in the filesystem', () => {
    const editPagePath = path.join(
      ROOT,
      'admin', 'src', 'app', '(dashboard)', 'products', 'edit', '[id]', 'page.tsx'
    );

    const exists = fs.existsSync(editPagePath);
    // Documents current state: file DOES exist
    expect(exists).toBe(true);
  });

  test('Admin products/edit/[id]/page.tsx has a default export and uses product id param', () => {
    const editPagePath = path.join(
      ROOT,
      'admin', 'src', 'app', '(dashboard)', 'products', 'edit', '[id]', 'page.tsx'
    );

    if (!fs.existsSync(editPagePath)) {
      expect(fs.existsSync(editPagePath)).toBe(true);
      return;
    }

    const source = fs.readFileSync(editPagePath, 'utf8');
    const hasDefaultExport = source.includes('export default');
    const usesProductId = source.includes('useParams') || source.includes('{ id }') || source.includes('params.id');
    expect(hasDefaultExport).toBe(true);
    expect(usesProductId).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug J — Dead add-product modal
// showAddModal state exists in admin/products/page.tsx but is unreachable.
// EXPECTED: FAIL — showAddModal state IS present (dead/unreachable code).
// Requirements: 1.30
// ---------------------------------------------------------------------------
describe('Bug J — Dead add-product modal', () => {
  test('isBugCondition_DeadAddModal — admin products page does NOT have showAddModal dead state', () => {
    const source = readAdmin('products/page.tsx');

    const hasShowAddModal = source.includes('showAddModal');

    // EXPECTED TO FAIL on buggy code — showAddModal IS present as dead code
    expect(hasShowAddModal).toBe(false);
    // ^ WILL FAIL — showAddModal state is in the file but "Add New Product" navigates away
  });
});

// ---------------------------------------------------------------------------
// Bug J — Banner base64 storage
// admin/banners/page.tsx uses FileReader.readAsDataURL to store base64 in MongoDB.
// EXPECTED: FAIL — base64 approach IS present.
// Requirements: 1.31
// ---------------------------------------------------------------------------
describe('Bug J — Banner base64 storage', () => {
  test('isBugCondition_BannerBase64 — admin banners page does NOT use FileReader', () => {
    const source = readAdmin('banners/page.tsx');

    const usesFileReader = source.includes('FileReader');

    // EXPECTED TO FAIL on buggy code — FileReader IS used
    expect(usesFileReader).toBe(false);
    // ^ WILL FAIL
  });

  test('isBugCondition_BannerBase64 — admin banners page does NOT use readAsDataURL', () => {
    const source = readAdmin('banners/page.tsx');

    const usesReadAsDataURL = source.includes('readAsDataURL');

    // EXPECTED TO FAIL on buggy code
    expect(usesReadAsDataURL).toBe(false);
    // ^ WILL FAIL
  });

  test('isBugCondition_BannerBase64 — banner image is NOT set from reader.result (base64 data URI)', () => {
    const source = readAdmin('banners/page.tsx');

    // BUG pattern: image is set to reader.result (base64)
    const setsImageToReaderResult = source.includes('reader.result');

    // EXPECTED TO FAIL on buggy code
    expect(setsImageToReaderResult).toBe(false);
    // ^ WILL FAIL — reader.result (base64 data URI) is assigned to newBanner.image
  });
});

// ---------------------------------------------------------------------------
// Bug K — EditProductScreen missing required fields (isBugCondition_EditProductMissingFields)
// formData state should include all required backend fields.
// NOTE: Most fields exist in current code. listPrice may be missing.
// Requirements: 1.32
// ---------------------------------------------------------------------------
describe('Bug K — EditProductScreen missing required fields (isBugCondition_EditProductMissingFields)', () => {
  const REQUIRED_FIELDS = [
    'sku', 'brand', 'manufacturer', 'subCategory',
    'productType', 'minimumAge', 'countryOfOrigin', 'listPrice'
  ];

  REQUIRED_FIELDS.forEach((field) => {
    test(`isBugCondition_EditProductMissingFields — formData includes required field: ${field}`, () => {
      const source = readSrc('screens/EditProductScreen.tsx');

      // Check that the field appears in the formData useState initializer
      const fieldInFormData = new RegExp(`\\b${field}\\s*:`).test(source);

      // EXPECTED TO FAIL if field is absent from formData
      expect(fieldInFormData).toBe(true);
      // listPrice will FAIL if not present in formData
    });
  });
});

// ---------------------------------------------------------------------------
// Bug K — Admin products category display
// admin/products/page.tsx accesses product.category (non-existent field).
// EXPECTED: FAIL — product.category IS accessed.
// Requirements: 1.33
// ---------------------------------------------------------------------------
describe('Bug K — Admin products category display', () => {
  test('isBugCondition_AdminCategory — products page does NOT access product.category (non-existent field)', () => {
    const source = readAdmin('products/page.tsx');

    // BUG: accessing product.category which does not exist on the backend model
    const accessesProductCategory = source.includes('product.category');

    // EXPECTED TO FAIL on buggy code — product.category IS accessed
    expect(accessesProductCategory).toBe(false);
    // ^ WILL FAIL — product.category is rendered in both desktop table and mobile card
  });
});

// ---------------------------------------------------------------------------
// Bug L — Circular dependency (isBugCondition_CircularImport)
// apiClient.ts imports store at the top level, creating a circular dep.
// NOTE: Already fixed in current codebase — uses lazy dynamic import.
// Requirements: 1.35
// ---------------------------------------------------------------------------
describe('Bug L — Circular dependency (isBugCondition_CircularImport)', () => {
  test('isBugCondition_CircularImport — apiClient does NOT import store at the top level', () => {
    const source = readSrc('api/apiClient.ts');

    // BUG: top-level static import of store
    const hasTopLevelStoreImport = /^import\s+.*from\s+['"].*redux\/store['"]/m.test(source);

    // Documents current state: no top-level import (already fixed with lazy import)
    expect(hasTopLevelStoreImport).toBe(false);
  });

  test('isBugCondition_CircularImport — apiClient uses lazy dynamic import for store inside interceptors', () => {
    const source = readSrc('api/apiClient.ts');

    const usesLazyImport =
      source.includes("await import('../redux/store')") ||
      source.includes('await import("../redux/store")') ||
      source.includes("require('../redux/store')");

    // Documents current state: lazy import IS used (bug fixed)
    expect(usesLazyImport).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug M — Logo.tsx empty file
// Logo.tsx is an empty file with no exports.
// NOTE: File is NOT empty in current codebase — already has a full component.
// Requirements: 1.36
// ---------------------------------------------------------------------------
describe('Bug M — Logo.tsx empty file', () => {
  test('isBugCondition_LogoEmpty — Logo.tsx is NOT empty', () => {
    const source = readSrc('components/common/Logo.tsx');

    const isEmpty = source.trim().length === 0;
    // Documents current state: file is NOT empty
    expect(isEmpty).toBe(false);
  });

  test('isBugCondition_LogoEmpty — Logo.tsx has a default export', () => {
    const source = readSrc('components/common/Logo.tsx');

    const hasDefaultExport = source.includes('export default');
    // Documents current state: default export IS present
    expect(hasDefaultExport).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug M — Dead renderProductList
// HomeScreen.tsx defines renderProductList but never calls it.
// NOTE: Function is NOT present in current codebase — already removed.
// Requirements: 1.37
// ---------------------------------------------------------------------------
describe('Bug M — Dead renderProductList', () => {
  test('isBugCondition_DeadRenderProductList — HomeScreen does NOT define renderProductList', () => {
    const source = readSrc('screens/HomeScreen.tsx');

    const definesRenderProductList =
      source.includes('const renderProductList') ||
      source.includes('function renderProductList');

    // EXPECTED TO FAIL on buggy code — function IS defined but never called
    expect(definesRenderProductList).toBe(false);
    // Current code does NOT have renderProductList — PASSES (already removed)
  });
});

// ---------------------------------------------------------------------------
// Bug M — getFcmToken not exported
// notificationService.ts defines getFcmToken but does not export it.
// NOTE: Function IS exported in current codebase.
// Requirements: 1.38
// ---------------------------------------------------------------------------
describe('Bug M — getFcmToken not exported', () => {
  test('isBugCondition_getFcmTokenNotExported — getFcmToken IS exported from notificationService', () => {
    const source = readSrc('utils/notificationService.ts');

    const isExported =
      source.includes('export const getFcmToken') ||
      source.includes('export async function getFcmToken') ||
      source.includes('export { getFcmToken') ||
      source.includes('export function getFcmToken');

    // Documents current state: IS exported (bug already fixed or not present)
    expect(isExported).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug N — clearTokens sync/async mismatch
// authSlice.ts calls clearTokens() inside a synchronous reducer (fire-and-forget).
// NOTE: clearTokens is in an async thunk in current codebase — already fixed.
// Requirements: 1.39
// ---------------------------------------------------------------------------
describe('Bug N — clearTokens sync/async mismatch', () => {
  test('isBugCondition_ClearTokensSync — clearTokens is NOT inside synchronous logout reducer body', () => {
    const source = readSrc('redux/slices/authSlice.ts');

    // Look for the synchronous reducers section
    const reducersMatch = source.match(/reducers:\s*\{([\s\S]*?)\},\s*extraReducers/);
    const inSyncReducer = reducersMatch
      ? reducersMatch[1].includes('clearTokens')
      : false;

    // EXPECTED TO FAIL on buggy code — clearTokens IS in sync reducer
    expect(inSyncReducer).toBe(false);
    // Currently clearTokens is in logoutUser async thunk (not sync reducer) — PASSES
  });

  test('isBugCondition_ClearTokensSync — clearTokens is awaited in an async thunk', () => {
    const source = readSrc('redux/slices/authSlice.ts');

    const isAwaited = source.includes('await clearTokens()');

    // Documents current state: clearTokens IS awaited in async thunk
    expect(isAwaited).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bug N — Admin nav hardcoded "/" check
// layout.tsx uses pathname === "/" which fails on sub-path deployments.
// EXPECTED: FAIL — hardcoded "/" check without basePath robustness IS present.
// Requirements: 1.40
// ---------------------------------------------------------------------------
describe('Bug N — Admin nav hardcoded "/" check', () => {
  test('isBugCondition_AdminNavHardcodedSlash — admin layout does NOT use pathname === "/" as sole active check', () => {
    const source = readAdmin('layout.tsx');

    // BUG pattern: checks `pathname === "/"` without configurable basePath
    const hasHardcodedSlashCheck = /pathname\s*===\s*["']\/["']/.test(source);
    const hasBasePathSupport = source.includes('basePath') || source.includes('NEXT_PUBLIC_BASE_PATH');

    // Bug is present when: hardcoded slash check exists AND no basePath support
    const isBugPresent = hasHardcodedSlashCheck && !hasBasePathSupport;

    // EXPECTED TO FAIL on buggy code — hardcoded "/" IS present without basePath
    expect(isBugPresent).toBe(false);
    // ^ WILL FAIL — layout.tsx uses `pathname === "/" || pathname === ""` without basePath
  });
});

// ---------------------------------------------------------------------------
// Bug I — Duplicate export in PaymentMethodsScreen
// PaymentMethodsScreen.tsx has two export default statements.
// EXPECTED: FAIL — duplicate export default IS present.
// Requirements: 1.28
// ---------------------------------------------------------------------------
describe('Bug I — Duplicate export in PaymentMethodsScreen', () => {
  test('isBugCondition_DuplicateExport — PaymentMethodsScreen has exactly ONE export default statement', () => {
    const source = readSrc('screens/PaymentMethodsScreen.tsx');

    const matches = source.match(/\bexport\s+default\b/g);
    const exportDefaultCount = matches ? matches.length : 0;

    // EXPECTED TO FAIL on buggy code — two export defaults exist
    expect(exportDefaultCount).toBe(1);
    // ^ WILL FAIL — there are 2 `export default PaymentMethodsScreen;` statements
  });
});

// ---------------------------------------------------------------------------
// Bug D — ProfileScreen unsafe admin navigation
// ProfileScreen.tsx calls navigation.navigate('Admin' as never).
// EXPECTED: FAIL — `as never` cast IS present.
// Requirements: 1.14
// ---------------------------------------------------------------------------
describe('Bug D — ProfileScreen unsafe admin navigation', () => {
  test('isBugCondition_AsNeverCast — ProfileScreen does NOT use "as never" cast in navigation calls', () => {
    const source = readSrc('screens/ProfileScreen.tsx');

    const hasAsNever = source.includes('as never');

    // EXPECTED TO FAIL on buggy code — `as never` IS present
    expect(hasAsNever).toBe(false);
    // ^ WILL FAIL — navigation.navigate('Admin' as never) and others use `as never`
  });
});
