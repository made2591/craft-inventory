import { formatCost, formatPrice, formatQuantity, formatInputNumber, parseFormattedNumber } from './formatters';

/**
 * Global mixin for formatting utilities
 * Add this to Vue app to make formatting functions available in all components
 */
export const FormatterMixin = {
  methods: {
    /**
     * Format cost with currency symbol
     */
    $formatCost(cost, currency = '€') {
      return formatCost(cost, currency);
    },

    /**
     * Format price with currency symbol (always 2 decimals)
     */
    $formatPrice(price, currency = '€', decimals = 2) {
      return formatPrice(price, currency, decimals);
    },

    /**
     * Format quantity (integer if no decimals)
     */
    $formatQuantity(quantity, maxDecimals = 2) {
      return formatQuantity(quantity, maxDecimals);
    },

    /**
     * Format number for input fields
     */
    $formatInputNumber(value, maxDecimals = 2) {
      return formatInputNumber(value, maxDecimals);
    },

    /**
     * Parse formatted string back to number
     */
    $parseFormattedNumber(formattedValue) {
      return parseFormattedNumber(formattedValue);
    }
  }
};

/**
 * Install function for Vue 3
 */
export function installFormatters(app) {
  app.mixin(FormatterMixin);
  
  // Also make them available as global properties
  app.config.globalProperties.$formatCost = formatCost;
  app.config.globalProperties.$formatPrice = formatPrice;
  app.config.globalProperties.$formatQuantity = formatQuantity;
  app.config.globalProperties.$formatInputNumber = formatInputNumber;
  app.config.globalProperties.$parseFormattedNumber = parseFormattedNumber;
}
