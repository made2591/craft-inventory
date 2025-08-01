# Craft Inventory Management System - Architecture Guide

## 📋 Overview

This document provides a comprehensive overview of the Craft Inventory Management System architecture. The application is designed as a modern web application with a clear separation between frontend and backend, utilizing containerization for easy deployment and scalability.

## 🏗 Technology Stack

### Backend Technologies
- **Runtime**: Node.js (JavaScript runtime environment)
- **Web Framework**: Express.js (fast, unopinionated web framework)
- **Database**: PostgreSQL (robust, scalable relational database)
- **Authentication**: JWT (JSON Web Tokens) for secure authentication
- **Containerization**: Docker and Docker Compose for consistent deployment
- **Environment Management**: dotenv for configuration management

### Frontend Technologies
- **Framework**: Vue 3 (progressive JavaScript framework)
- **Routing**: Vue Router (official router for Vue.js)
- **HTTP Client**: Axios (promise-based HTTP client)
- **Styling**: Custom CSS with responsive design principles
- **Internationalization**: Vue I18n for multi-language support
- **State Management**: Composition API for component state management

## 📁 Project Architecture

```
craft-inventory-app/
├── backend/                    # Backend API server
│   ├── migrations/            # Database schema migrations
│   │   ├── 20250718000001_create_tables.sql
│   │   ├── 20250720000001_create_components.sql
│   │   └── ...migration files
│   ├── init-db/              # Database initialization scripts
│   │   ├── 01-init.sql       # Initial schema creation
│   │   └── 02-seed-data.sql  # Sample data insertion
│   ├── routes/               # API route definitions
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── inventory.js      # Inventory management
│   │   ├── materials.js      # Materials management
│   │   ├── components.js     # Components management
│   │   ├── customers.js      # Customer management
│   │   ├── suppliers.js      # Supplier management
│   │   ├── transactions.js   # Transaction handling
│   │   └── kiosk.js          # Kiosk mode endpoints
│   ├── uploads/              # File upload storage
│   ├── logs/                 # Application logs
│   ├── backups/              # Database backups
│   ├── server.js             # Main server application
│   ├── Dockerfile            # Docker configuration
│   ├── package.json          # Node.js dependencies
│   └── .env.example          # Environment configuration template
├── frontend/                  # Vue.js frontend application
│   ├── public/               # Static assets
│   │   ├── index.html        # Main HTML template
│   │   └── favicon.ico       # Application icon
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable Vue components
│   │   │   ├── ActionMenu.vue
│   │   │   └── Sidebar.vue
│   │   ├── views/            # Page components
│   │   │   ├── Home.vue
│   │   │   ├── Inventory.vue
│   │   │   ├── Materials.vue
│   │   │   ├── Components.vue
│   │   │   ├── Customers.vue
│   │   │   ├── Suppliers.vue
│   │   │   └── Transactions.vue
│   │   ├── services/         # API service layer
│   │   │   ├── api.js        # Base API configuration
│   │   │   ├── materialService.js
│   │   │   ├── componentService.js
│   │   │   ├── supplierService.js
│   │   │   └── transactionService.js
│   │   ├── router/           # Vue Router configuration
│   │   │   └── index.js
│   │   ├── i18n/             # Internationalization
│   │   │   ├── index.js      # I18n configuration
│   │   │   └── locales/      # Translation files
│   │   │       ├── en.json   # English translations
│   │   │       └── it.json   # Italian translations
│   │   ├── utils/            # Utility functions
│   │   │   ├── formatters.js
│   │   │   └── formatterMixin.js
│   │   ├── assets/           # Styles and images
│   │   │   ├── main.css      # Main stylesheet
│   │   │   └── responsive.css # Responsive design
│   │   ├── App.vue           # Root component
│   │   └── main.js           # Application entry point
│   ├── Dockerfile            # Docker configuration
│   ├── vite.config.js        # Vite build configuration
│   ├── package.json          # Frontend dependencies
│   └── .env.example          # Environment configuration template
├── docs/                      # Project documentation
│   ├── architecture.md       # This file
│   └── KIOSK_MODE.md         # Kiosk mode documentation
├── docker-compose.yml         # Local development
├── docker-compose-kiosk.yml   # Kiosk mode with auto-reset
├── docker-compose-cloudflared.yml # Production with tunnel
└── README.md                  # Project overview
```

## 🗃 Database Schema

The application uses PostgreSQL with the following main entities:

### 📦 Materials
- **Purpose**: Represents raw materials used in production
- **Key Attributes**: id, name, description, unit of measure, cost per unit, stock quantity, minimum stock level, supplier reference, supplier link
- **Relationships**: Many-to-many with ProductModel through ModelMaterial

### 🎨 ProductModel  
- **Purpose**: Represents a product design/model that can be manufactured
- **Key Attributes**: id, name, description, SKU, production cost, selling price, labor time
- **Relationships**: Many-to-many with Materials and Components

### 🔧 Component
- **Purpose**: Represents components used in product models
- **Key Attributes**: id, name, SKU, description, available quantity
- **Relationships**: Many-to-many with ProductModel through ModelComponent

### 📋 InventoryItem
- **Purpose**: Represents finished products available in inventory
- **Key Attributes**: id, model reference, quantity, production date, notes
- **Relationships**: References ProductModel

### 🏪 Supplier
- **Purpose**: Represents material suppliers
- **Key Attributes**: id, name, contact person, email, phone, address, website, notes, external link
- **Relationships**: One-to-many with Materials

### 👥 Customer
- **Purpose**: Represents customers (private, online channels, physical stores)
- **Key Attributes**: id, name, type (private/online/store), email, phone, address, notes, external link
- **Relationships**: One-to-many with Transactions

### 💼 Transaction
- **Purpose**: Represents purchase or sale transactions
- **Key Attributes**: id, type (sale/purchase), date, customer/supplier reference, total price, status
- **Relationships**: One-to-many with TransactionItem

### 📋 TransactionItem
- **Purpose**: Represents individual items within a transaction
- **Key Attributes**: id, transaction reference, material/product model reference, quantity, unit price
- **Relationships**: References Transaction and Material/ProductModel

## 🚀 Core Features

### 1. **Material Management**
- Add, edit, delete materials with full CRUD operations
- Real-time stock monitoring with low-stock alerts
- Purchase history tracking for each material
- Supplier integration with external links
- Cost analysis and price tracking

### 2. **Product Model Management**
- Create models with detailed component lists
- Automatic production cost calculation
- Selling price management with profit margin analysis
- SKU generation and management
- Material requirement planning

### 3. **Inventory Management**
- Finished product registration and tracking
- Real-time quantity monitoring
- Production tracking and history
- Sales history for each inventory item
- Automated stock level updates

### 4. **Supplier Management**
- Comprehensive supplier database
- Purchase history and performance tracking
- External website integration
- Contact management and communication logs
- Supplier performance analytics

### 5. **Customer Management**
- Multi-type customer support (private, online, retail)
- Order and sales history tracking
- External profile integration
- Customer communication management
- Sales analytics per customer

### 6. **Transaction Processing**
- Purchase and sale transaction management
- Multi-status workflow (pending, completed, cancelled)
- Automatic inventory updates based on transactions
- Paginated transaction history
- Financial reporting and analytics

### 7. **Reporting & Analytics**
- Cost and revenue analysis
- Sales performance reports
- Inventory forecasting
- Supplier performance metrics
- Customer behavior analytics

### 8. **Kiosk Demo Mode**
- Automatic database reset every 15 minutes
- Manual reset capabilities via API
- Status monitoring and logging
- Isolated environment for demonstrations

## 🔌 API Architecture

The application follows RESTful API principles with comprehensive endpoints:

### Materials API
- `GET /api/materials` - Paginated material list with filtering
- `GET /api/materials/{id}` - Detailed material information
- `GET /api/materials/{id}/purchases` - Material purchase history
- `POST /api/materials` - Create new material
- `PUT /api/materials/{id}` - Update existing material
- `DELETE /api/materials/{id}` - Remove material

### Product Models API
- `GET /api/models` - Paginated model list with component details
- `GET /api/models/{id}` - Detailed model information with BOM
- `POST /api/models` - Create new product model
- `PUT /api/models/{id}` - Update existing model
- `DELETE /api/models/{id}` - Remove model

### Components API
- `GET /api/components` - Paginated component list
- `GET /api/components/{id}` - Detailed component information
- `POST /api/components` - Create new component
- `PUT /api/components/{id}` - Update existing component
- `DELETE /api/components/{id}` - Remove component

### Inventory API
- `GET /api/inventory` - Paginated inventory list with stock levels
- `GET /api/inventory/{id}` - Detailed inventory item information
- `GET /api/inventory/{id}/sales` - Item sales history
- `POST /api/inventory` - Register new inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Remove inventory item

### Suppliers API
- `GET /api/suppliers` - Paginated supplier list
- `GET /api/suppliers/{id}` - Detailed supplier information
- `POST /api/suppliers` - Register new supplier
- `PUT /api/suppliers/{id}` - Update supplier information
- `DELETE /api/suppliers/{id}` - Remove supplier

### Customers API
- `GET /api/customers` - Paginated customer list with type filtering
- `GET /api/customers/{id}` - Detailed customer information
- `POST /api/customers` - Register new customer
- `PUT /api/customers/{id}` - Update customer information
- `DELETE /api/customers/{id}` - Remove customer

### Transactions API
- `GET /api/transactions` - Paginated transaction list with status filtering
- `GET /api/transactions/{id}` - Detailed transaction with items
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction status
- `DELETE /api/transactions/{id}` - Cancel transaction

### Kiosk Mode API
- `GET /api/kiosk/status` - Get kiosk mode status and reset timer
- `POST /api/kiosk/reset` - Trigger manual database reset (kiosk mode only)

## 📄 Pagination Implementation

The application implements server-side pagination for optimal performance:

**Supported Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for filtering
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (asc/desc)

**Standard Pagination Response:**
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT-based authentication** for secure API access
- **Token expiration** with refresh token support
- **Role-based access control** for different user types
- **CORS configuration** for cross-origin requests

### Data Protection
- **Input validation** for all API endpoints
- **SQL injection prevention** through parameterized queries
- **XSS protection** with content security policies
- **File upload restrictions** with type and size validation

### Environment Security
- **Environment variable management** for sensitive configuration
- **Database connection pooling** with connection limits
- **Rate limiting** for API endpoints
- **Request logging** for security monitoring

## 🐳 Deployment Architecture

### Docker Configuration
- **Multi-stage builds** for optimized image sizes
- **Environment-specific configurations** (dev, kiosk, production)
- **Network isolation** between different environments
- **Volume management** for persistent data storage

### Database Management
- **Automated migrations** on container startup
- **Seed data initialization** for development and demo
- **Backup and restore** capabilities
- **Connection pooling** for optimal performance

### Load Balancing & Scaling
- **Horizontal scaling** support through Docker Compose
- **Database connection pooling** for concurrent requests
- **Static asset serving** through Nginx
- **Health check endpoints** for monitoring

## 🔄 Development Workflow

### Local Development
1. **Environment Setup**: Copy `.env.example` files and configure
2. **Database Initialization**: Automatic migration and seed data
3. **Hot Reloading**: Both frontend and backend support live reload
4. **API Testing**: Built-in endpoints for testing all functionality

### Deployment Process
1. **Build Images**: Docker builds for frontend and backend
2. **Database Migration**: Automatic schema updates
3. **Environment Configuration**: Production-ready settings
4. **Health Monitoring**: Status endpoints for application health

This architecture ensures scalability, maintainability, and security while providing a comprehensive solution for craft inventory management.
  ```

## Interfaccia Utente

L'interfaccia utente è progettata per essere intuitiva e responsive, con le seguenti caratteristiche:

1. **Dashboard**
   - Panoramica delle scorte
   - Avvisi per scorte basse
   - Transazioni recenti

2. **Gestione Materiali**
   - Lista materiali con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli con storico acquisti

3. **Gestione Modelli**
   - Lista modelli con filtri e paginazione
   - Form di creazione/modifica con aggiunta componenti
   - Visualizzazione dettagli

4. **Gestione Magazzino**
   - Lista articoli con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli con storico vendite

5. **Gestione Transazioni**
   - Lista transazioni con filtri e paginazione
   - Form di creazione/modifica
   - Visualizzazione dettagli

## Deployment

L'applicazione è containerizzata con Docker per facilitare il deployment:

- **Backend**: Container Node.js con Express
- **Frontend**: Container Nginx che serve l'applicazione Vue compilata
- **Database**: Container PostgreSQL
- **Networking**: Configurato tramite Docker Compose

## Sicurezza

- Validazione degli input
- Protezione contro attacchi CSRF e XSS
- Sanitizzazione dei dati
- Gestione sicura delle transazioni nel database

## Funzionalità Future

1. Autenticazione e gestione utenti
2. Sistema di notifiche per scorte basse
3. Integrazione con servizi di e-commerce
4. App mobile per la gestione in mobilità
5. Generazione di report avanzati e grafici
6. Gestione di più magazzini/location
7. Sistema di prenotazione e ordini