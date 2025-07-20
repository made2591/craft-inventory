import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/materials',
    name: 'Materials',
    component: () => import('../views/Materials.vue')
  },
  {
    path: '/materials/new',
    name: 'NewMaterial',
    component: () => import('../views/MaterialForm.vue')
  },
  {
    path: '/materials/:id',
    name: 'EditMaterial',
    component: () => import('../views/MaterialForm.vue'),
    props: true
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('../views/Models.vue')
  },
  {
    path: '/models/new',
    name: 'NewModel',
    component: () => import('../views/ModelForm.vue')
  },
  {
    path: '/models/:id',
    name: 'EditModel',
    component: () => import('../views/ModelForm.vue'),
    props: true
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Inventory.vue')
  },
  {
    path: '/inventory/new',
    name: 'NewInventoryItem',
    component: () => import('../views/InventoryForm.vue')
  },
  {
    path: '/inventory/:id',
    name: 'EditInventoryItem',
    component: () => import('../views/InventoryForm.vue'),
    props: true
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: () => import('../views/Suppliers.vue')
  },
  {
    path: '/suppliers/new',
    name: 'NewSupplier',
    component: () => import('../views/SupplierForm.vue')
  },
  {
    path: '/suppliers/:id',
    name: 'EditSupplier',
    component: () => import('../views/SupplierForm.vue'),
    props: true
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('../views/Customers.vue')
  },
  {
    path: '/customers/new',
    name: 'NewCustomer',
    component: () => import('../views/CustomerForm.vue')
  },
  {
    path: '/customers/:id',
    name: 'EditCustomer',
    component: () => import('../views/CustomerForm.vue'),
    props: true
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('../views/Transactions.vue')
  },
  {
    path: '/transactions/new',
    name: 'NewTransaction',
    component: () => import('../views/TransactionForm.vue')
  },
  {
    path: '/transactions/:id',
    name: 'TransactionDetails',
    component: () => import('../views/TransactionDetails.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router