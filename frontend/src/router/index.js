import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/database',
    name: 'DatabaseManagement',
    component: () => import('../views/DatabaseManagement.vue')
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('../views/Components.vue')
  },
  {
    path: '/components/new',
    name: 'NewComponent',
    component: () => import('../views/ComponentForm.vue')
  },
  {
    path: '/components/:id',
    name: 'EditComponent',
    component: () => import('../views/ComponentForm.vue'),
    props: true
  },
  {
    path: '/components/:id/view',
    name: 'ViewComponent',
    component: () => import('../views/ComponentView.vue'),
    props: true
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
    path: '/materials/:id/view',
    name: 'ViewMaterial',
    component: () => import('../views/MaterialView.vue'),
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
    path: '/models/:id/view',
    name: 'ViewModel',
    component: () => import('../views/ModelView.vue'),
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
    path: '/inventory/:id/view',
    name: 'ViewInventoryItem',
    component: () => import('../views/InventoryView.vue'),
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
    path: '/suppliers/:id/view',
    name: 'ViewSupplier',
    component: () => import('../views/SupplierView.vue'),
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
    path: '/customers/:id/view',
    name: 'ViewCustomer',
    component: () => import('../views/CustomerView.vue'),
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