import api from './api';

export default {
  /**
   * Ottiene tutti i fornitori
   * @returns {Promise} Promise con la lista dei fornitori
   */
  getAllSuppliers() {
    return api.get('/api/suppliers');
  },

  /**
   * Ottiene un fornitore specifico per ID
   * @param {string} id - ID del fornitore
   * @returns {Promise} Promise con i dettagli del fornitore
   */
  getSupplierById(id) {
    return api.get(`/api/suppliers/${id}`);
  },

  /**
   * Crea un nuovo fornitore
   * @param {Object} supplier - Dati del fornitore da creare
   * @returns {Promise} Promise con il fornitore creato
   */
  createSupplier(supplier) {
    return api.post('/api/suppliers', supplier);
  },

  /**
   * Aggiorna un fornitore esistente
   * @param {string} id - ID del fornitore
   * @param {Object} supplier - Dati aggiornati del fornitore
   * @returns {Promise} Promise con il fornitore aggiornato
   */
  updateSupplier(id, supplier) {
    return api.put(`/api/suppliers/${id}`, supplier);
  },

  /**
   * Elimina un fornitore
   * @param {string} id - ID del fornitore
   * @returns {Promise} Promise vuota in caso di successo
   */
  deleteSupplier(id) {
    return api.delete(`/api/suppliers/${id}`);
  }
};