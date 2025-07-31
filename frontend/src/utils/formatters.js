/**
 * Utility functions for formatting numbers, currencies, and quantities
 */

/**
 * Formats a quantity as integer if it has no decimals, otherwise shows decimals
 * @param {number|string} quantity - The quantity to format
 * @param {number} maxDecimals - Maximum decimal places to show (default: 2)
 * @returns {string} Formatted quantity
 */
export function formatQuantity(quantity, maxDecimals = 2) {
  if (quantity === undefined || quantity === null || quantity === '') {
    return '0';
  }
  
  const num = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  
  if (isNaN(num)) {
    return '0';
  }
  
  // Check if the number is effectively an integer
  if (num % 1 === 0) {
    return Math.round(num).toString();
  }
  
  // Format with decimals, removing trailing zeros
  return parseFloat(num.toFixed(maxDecimals)).toString();
}

/**
 * Formats a price with currency symbol
 * @param {number|string} price - The price to format
 * @param {string} currency - Currency symbol (default: '€')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price with currency
 */
export function formatPrice(price, currency = '€', decimals = 2) {
  if (price === undefined || price === null || price === '') {
    return `${currency} 0.00`;
  }
  
  const num = typeof price === 'number' ? price : parseFloat(price);
  
  if (isNaN(num)) {
    return `${currency} 0.00`;
  }
  
  // Always show 2 decimal places for prices
  const formattedPrice = num.toFixed(decimals);
  return `${currency} ${formattedPrice}`;
}

/**
 * Formats a cost value with fixed 2 decimal places and currency symbol
 * @param {number|string} cost - The cost to format
 * @param {string} currency - Currency symbol (default: '€')
 * @returns {string} Formatted cost with currency and 2 decimal places
 */
export function formatCost(cost, currency = '€') {
  if (cost === undefined || cost === null || cost === '') {
    return `${currency} 0.00`;
  }
  
  const num = typeof cost === 'number' ? cost : parseFloat(cost);
  
  if (isNaN(num)) {
    return `${currency} 0.00`;
  }
  
  // Always show 2 decimal places for costs/prices
  const formatted = num.toFixed(2);
  return `${currency} ${formatted}`;
}

/**
 * Formats currency values (alias for formatCost for consistency)
 * @param {number|string} value - The currency value to format
 * @param {string} currency - Currency symbol (default: '€')
 * @returns {string} Formatted currency value
 */
export function formatCurrency(value, currency = '€') {
  return formatCost(value, currency);
}

/**
 * Formats a number for input fields (no currency symbol)
 * @param {number|string} value - The value to format
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted number for input
 */
export function formatInputNumber(value, maxDecimals = 2) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num)) {
    return '';
  }
  
  if (num % 1 === 0) {
    return Math.round(num).toString();
  }
  
  return parseFloat(num.toFixed(maxDecimals)).toString();
}

/**
 * Parses a formatted string back to a number
 * @param {string} formattedValue - The formatted string
 * @returns {number} Parsed number
 */
export function parseFormattedNumber(formattedValue) {
  if (!formattedValue || typeof formattedValue !== 'string') {
    return 0;
  }
  
  // Remove currency symbols and spaces
  const cleaned = formattedValue.replace(/[€$£¥\s]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
}
