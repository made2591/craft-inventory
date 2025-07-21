import api from './api';

/**
 * Servizio per la gestione dei componenti
 */
export default {
  /**
   * Ottiene tutti i componenti
   * @returns {Promise} Promise con i dati dei componenti
   */
  getAllComponents() {
    return api.get('/api/components');
  },

  /**
   * Ottiene un componente specifico con i suoi materiali
   * @param {string} id - ID del componente
   * @returns {Promise} Promise con i dati del componente
   */
  getComponent(id) {
    return api.get(`/api/components/${id}`);
  },

  /**
   * Crea un nuovo componente
   * @param {Object} component - Dati del componente da creare
   * @returns {Promise} Promise con i dati del componente creato
   */
  createComponent(component) {
    return api.post('/api/components', component);
  },

  /**
   * Aggiorna un componente esistente
   * @param {string} id - ID del componente da aggiornare
   * @param {Object} component - Dati aggiornati del componente
   * @returns {Promise} Promise con i dati del componente aggiornato
   */
  updateComponent(id, component) {
    return api.put(`/api/components/${id}`, component);
  },

  /**
   * Elimina un componente
   * @param {string} id - ID del componente da eliminare
   * @returns {Promise} Promise con l'esito dell'operazione
   */
  deleteComponent(id) {
    return api.delete(`/api/components/${id}`);
  },

  /**
   * Calcola il costo totale di un componente
   * @param {string} id - ID del componente
   * @returns {Promise} Promise con i dati del costo
   */
  getComponentCost(id) {
    return api.get(`/api/components/${id}/cost`);
  }
};