import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validations
export const validateUUID = (field) => 
  param(field).isUUID().withMessage(`${field} must be a valid UUID`);

export const validateOptionalUUID = (field) =>
  param(field).optional().isUUID().withMessage(`${field} must be a valid UUID`);

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Material validations
export const validateMaterialCreation = [
  body('name').notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name is required and must not exceed 255 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('costPerUnit').isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('unit').optional().isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateMaterialUpdate = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('unit').optional().isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Component validations
export const validateComponentCreation = [
  body('name').notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name is required and must not exceed 255 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('costPerUnit').isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('currentStock').isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('sku').optional().isLength({ max: 100 }).withMessage('SKU must not exceed 100 characters'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateComponentUpdate = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('costPerUnit').optional().isFloat({ min: 0 }).withMessage('Cost per unit must be a positive number'),
  body('currentStock').optional().isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('minimumStock').optional().isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('sku').optional().isLength({ max: 100 }).withMessage('SKU must not exceed 100 characters'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Inventory validations
export const validateInventoryCreation = [
  body('modelId').isUUID().withMessage('Model ID must be a valid UUID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('productionDate').optional().isISO8601().withMessage('Production date must be a valid ISO date'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateInventoryUpdate = [
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('productionDate').optional().isISO8601().withMessage('Production date must be a valid ISO date'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Customer validations
export const validateCustomerCreation = [
  body('name').notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name is required and must not exceed 255 characters'),
  body('contactPerson').optional().isLength({ max: 255 }).withMessage('Contact person must not exceed 255 characters'),
  body('customerType').optional().isIn(['private', 'business']).withMessage('Customer type must be private or business'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('phone').optional().isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateCustomerUpdate = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('contactPerson').optional().isLength({ max: 255 }).withMessage('Contact person must not exceed 255 characters'),
  body('customerType').optional().isIn(['private', 'business']).withMessage('Customer type must be private or business'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('phone').optional().isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Supplier validations
export const validateSupplierCreation = [
  body('name').notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name is required and must not exceed 255 characters'),
  body('contactPerson').optional().isLength({ max: 255 }).withMessage('Contact person must not exceed 255 characters'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('phone').optional().isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateSupplierUpdate = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('contactPerson').optional().isLength({ max: 255 }).withMessage('Contact person must not exceed 255 characters'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
  body('phone').optional().isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
  body('address').optional().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('link').optional().isURL().withMessage('Link must be a valid URL'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Model validations
export const validateModelCreation = [
  body('name').notEmpty().isLength({ min: 1, max: 255 }).withMessage('Name is required and must not exceed 255 characters'),
  body('sku').optional().isLength({ max: 100 }).withMessage('SKU must not exceed 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('version').optional().isLength({ max: 50 }).withMessage('Version must not exceed 50 characters'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateModelUpdate = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters'),
  body('sku').optional().isLength({ max: 100 }).withMessage('SKU must not exceed 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('version').optional().isLength({ max: 50 }).withMessage('Version must not exceed 50 characters'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Authentication validations
export const validateUserRegistration = [
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const validateUserLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Transaction validations
export const validateTransactionCreation = [
  body('transactionType').isIn(['purchase', 'sale', 'adjustment']).withMessage('Invalid transaction type'),
  body('date').isISO8601().withMessage('Date must be a valid ISO date'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('customerId').optional().isUUID().withMessage('Customer ID must be a valid UUID'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

export const validateTransactionUpdate = [
  body('transactionType').optional().isIn(['purchase', 'sale', 'adjustment']).withMessage('Invalid transaction type'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('supplierId').optional().isUUID().withMessage('Supplier ID must be a valid UUID'),
  body('customerId').optional().isUUID().withMessage('Customer ID must be a valid UUID'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

// Search and filter validations
export const validateSearch = [
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('category').optional().isLength({ max: 100 }).withMessage('Category filter must not exceed 100 characters'),
  query('sortBy').optional().isIn(['name', 'createdAt', 'updatedAt', 'price', 'quantity']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];
