/**
 * Standardized CSS constants for consistent styling across the Mai Aisha Academy app
 * Beautiful, modern design with proper spacing and margins
 */

import { StyleSheet } from 'react-native';

// Standard spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Standard margins (left/right consistent spacing)
export const MARGINS = {
  horizontal: SPACING.xl, // 20px left/right margin
  vertical: SPACING.lg,   // 16px top/bottom margin
  container: SPACING.xl,  // 20px container padding
  card: SPACING.lg,       // 16px card padding
  section: SPACING.md,    // 12px section spacing
} as const;

// Standard border radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50,
} as const;

// Standard shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Standard typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

// Standard component styles
export const STANDARD_STYLES = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingHorizontal: MARGINS.horizontal,
    paddingVertical: MARGINS.vertical,
  },
  
  safeContainer: {
    flex: 1,
    paddingHorizontal: MARGINS.horizontal,
  },
  
  scrollContainer: {
    paddingHorizontal: MARGINS.horizontal,
    paddingVertical: MARGINS.vertical,
    paddingBottom: 100, // Space for bottom navigation
  },

  // Card styles
  card: {
    backgroundColor: '#fff', // Will be overridden by theme
    borderRadius: BORDER_RADIUS.md,
    padding: MARGINS.card,
    marginVertical: SPACING.sm,
    ...SHADOWS.md,
  },

  cardLarge: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: MARGINS.container,
    marginVertical: SPACING.md,
    ...SHADOWS.lg,
  },

  // Button styles
  buttonPrimary: {
    backgroundColor: '#1E90FF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input styles
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MARGINS.horizontal,
    paddingVertical: SPACING.lg,
    backgroundColor: '#1E90FF',
  },

  // Section styles
  section: {
    marginVertical: MARGINS.section,
  },

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
    marginHorizontal: MARGINS.horizontal,
  },

  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MARGINS.horizontal,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  // Modal styles
  modal: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: MARGINS.container,
    margin: MARGINS.horizontal,
    ...SHADOWS.lg,
  },

  // Form styles
  formGroup: {
    marginBottom: SPACING.lg,
  },

  formLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },

  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.sm,
  },

  gridItem: {
    flex: 1,
    marginHorizontal: SPACING.sm,
    marginVertical: SPACING.sm,
  },

  // Utility styles
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Text styles
  textPrimary: {
    ...TYPOGRAPHY.body,
  },

  textSecondary: {
    ...TYPOGRAPHY.bodySmall,
    opacity: 0.7,
  },

  textCaption: {
    ...TYPOGRAPHY.caption,
    opacity: 0.6,
  },
});

// Helper function to create consistent spacing
export const createSpacing = (multiplier: number) => SPACING.md * multiplier;

// Helper function to create theme-aware styles
export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    ...STANDARD_STYLES.container,
    backgroundColor: colors.background,
  },
  
  card: {
    ...STANDARD_STYLES.card,
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  
  text: {
    ...STANDARD_STYLES.textPrimary,
    color: colors.text,
  },
  
  textSecondary: {
    ...STANDARD_STYLES.textSecondary,
    color: colors.text,
  },
  
  input: {
    ...STANDARD_STYLES.input,
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    color: colors.text,
  },
});
