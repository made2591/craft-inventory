<template>
  <div class="materials">
    <h1>{{ $t('materials.title') }}</h1>

    <div class="actions">
      <router-link to="/materials/new" class="btn btn-primary">{{ $t('materials.newMaterial') }}</router-link>
      <button @click="refreshMaterials" class="btn btn-secondary" :disabled="loading">
        {{ loading ? $t('common.updating') : $t('materials.refreshMaterials') }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      {{ $t('common.loading') }}
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="materials.length === 0" class="empty-state">
      {{ $t('materials.noMaterialsFound') }}
    </div>

    <div v-else class="materials-list">
      <!-- Filtri e opzioni di paginazione -->
      <div class="table-controls">
        <div class="search-filter">
          <input type="text" v-model="searchQuery" :placeholder="$t('materials.searchPlaceholder')" @input="filterMaterials">
        </div>
        <div class="pagination-controls">
          <label for="itemsPerPage">{{ $t('common.itemsPerPage') }}:</label>
          <select id="itemsPerPage" v-model="itemsPerPage" @change="updatePagination">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th @click="sortBy('sku')" class="sortable">
              {{ $t('materials.sku') }}
              <span v-if="sortKey === 'sku'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('name')" class="sortable">
              {{ $t('materials.name') }}
              <span v-if="sortKey === 'name'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('unitOfMeasure')" class="sortable">
              {{ $t('materials.unitOfMeasure') }}
              <span v-if="sortKey === 'unitOfMeasure'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('costPerUnit')" class="sortable">
              {{ $t('materials.costPerUnit') }}
              <span v-if="sortKey === 'costPerUnit'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('currentStock')" class="sortable">
              {{ $t('materials.currentStock') }}
              <span v-if="sortKey === 'currentStock'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="sortBy('minStockLevel')" class="sortable">
              {{ $t('materials.minStockLevel') }}
              <span v-if="sortKey === 'minStockLevel'" class="sort-icon">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="material in paginatedMaterials" :key="material.id" :class="{ 'low-stock': isLowStock(material) }">
            <td>
              <router-link :to="`/materials/${material.id}/view`" class="sku-link">
                <strong>{{ material.sku || 'N/A' }}</strong>
              </router-link>
            </td>
            <td>{{ material.name }}</td>
            <td>{{ material.unitOfMeasure }}</td>
            <td>{{ $formatCost(material.costPerUnit) }}</td>
            <td>{{ $formatQuantity(material.currentStock !== undefined && material.currentStock !== null ? material.currentStock : 0)
            }} {{ material.unitOfMeasure }}</td>
            <td>{{ material.minStockLevel ? $formatQuantity(material.minStockLevel) : 'N/A' }}</td>
            <td class="actions">
              <button @click="viewMaterial(material.id)" class="btn btn-sm btn-view">{{ $t('common.view') }}</button>
              <button @click="editMaterial(material.id)" class="btn btn-sm btn-edit">{{ $t('common.edit') }}</button>
              <button @click="deleteMaterial(material.id)" class="btn btn-sm btn-danger">{{ $t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginazione -->
      <div class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm">
          {{ $t('common.previous') }}
        </button>

        <div class="page-numbers">
          <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
            :class="['btn', 'btn-sm', currentPage === page ? 'btn-active' : '']">
            {{ page }}
          </button>
        </div>

        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm">
          {{ $t('common.next') }}
        </button>
      </div>

      <div class="pagination-info">
        {{ $t('common.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredMaterials.length }) }}
      </div>
    </div>
  </div>
</template>

<script>
import materialService from '../services/materialService';

export default {
  name: 'MaterialsView',
  data() {
    return {
      materials: [],
      filteredMaterials: [],
      loading: true,
      error: null,
      searchQuery: '',
      sortKey: 'name',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredMaterials.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      const end = this.startIndex + this.itemsPerPage;
      return end > this.filteredMaterials.length ? this.filteredMaterials.length : end;
    },
    paginatedMaterials() {
      return this.filteredMaterials.slice(this.startIndex, this.endIndex);
    }
  },
  created() {
    this.fetchMaterials();
  },
  methods: {
    async fetchMaterials() {
      this.loading = true;
      this.error = null;

      try {
        const response = await materialService.getAllMaterials();
        this.materials = response.data;

        // Compatibilità con i nomi dei campi
        this.materials = this.materials.map(material => {
          return {
            ...material,
            // Assicurati che i campi siano disponibili in camelCase
            unitOfMeasure: material.unitOfMeasure || material.unit_of_measure || '',
            costPerUnit: material.costPerUnit || material.cost_per_unit || 0,
            currentStock: material.currentStock || material.current_stock || 0,
            minStockLevel: material.minStockLevel || material.min_stock_level || null
          };
        });

        this.filterMaterials();
      } catch (error) {
        console.error('Error fetching materials:', error);
        this.error = 'Si è verificato un errore durante il recupero dei materiali. Riprova più tardi.';
      } finally {
        this.loading = false;
      }
    },

    filterMaterials() {
      if (!this.searchQuery) {
        this.filteredMaterials = [...this.materials];
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredMaterials = this.materials.filter(material =>
          material.name.toLowerCase().includes(query) ||
          material.description?.toLowerCase().includes(query) ||
          (material.unitOfMeasure && material.unitOfMeasure.toLowerCase().includes(query))
        );
      }

      this.sortMaterials();
      this.currentPage = 1;
    },

    sortMaterials() {
      const key = this.sortKey;
      const order = this.sortOrder;

      this.filteredMaterials.sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) valueA = '';
        if (valueB === null || valueB === undefined) valueB = '';

        // Compare based on type
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return order === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return order === 'asc'
            ? valueA - valueB
            : valueB - valueA;
        }
      });
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }

      this.sortMaterials();
    },

    updatePagination() {
      this.currentPage = 1;
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    isLowStock(material) {
      if (!material.minStockLevel) return false;

      // Converti i valori in numeri per assicurarsi che il confronto sia numerico
      const currentStock = parseFloat(material.currentStock);
      const minStockLevel = parseFloat(material.minStockLevel);

      // Verifica che entrambi i valori siano numeri validi
      if (isNaN(currentStock) || isNaN(minStockLevel)) return false;

      // Un materiale è considerato "low stock" solo quando la quantità disponibile è INFERIORE al livello minimo
      return currentStock < minStockLevel;
    },

    editMaterial(id) {
      this.$router.push(`/materials/${id}`);
    },

    async deleteMaterial(id) {
      if (!confirm('Sei sicuro di voler eliminare questo materiale?')) {
        return;
      }

      try {
        await materialService.deleteMaterial(id);
        this.materials = this.materials.filter(m => m.id !== id);
        this.filterMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Si è verificato un errore durante l\'eliminazione del materiale.');
      }
    },

    async refreshMaterials() {
      await this.fetchMaterials();
    },
    
    viewMaterial(id) {
      this.$router.push(`/materials/${id}/view`);
    }
  }
};
</script>

<style scoped>
.materials {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
  /* Altezza fissa per i pulsanti */
  line-height: 20px;
  /* Allineamento verticale del testo */
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-active {
  background-color: #42b983;
  color: white;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.error {
  color: #dc3545;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-filter input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-controls label {
  margin-right: 8px;
}

.pagination-controls select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th,
td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  vertical-align: middle;
  /* Allineamento verticale al centro */
  height: 44px;
  /* Altezza fissa per tutte le celle */
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

th.sortable {
  cursor: pointer;
  position: relative;
}

th.sortable:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.low-stock {
  background-color: #fff3cd;
}

.actions {
  display: flex;
  gap: 8px;
  margin: 0;
  /* Reset del margine */
  padding: 0;
  /* Reset del padding */
  justify-content: center;
  /* Centra orizzontalmente */
  align-items: center;
  /* Allineamento verticale */
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
}

.page-numbers {
  display: flex;
  gap: 5px;
  margin: 0 10px;
}

.pagination-info {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.sku-link {
  color: #3498db;
  text-decoration: none;
}

.sku-link:hover {
  text-decoration: underline;
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}
</style>