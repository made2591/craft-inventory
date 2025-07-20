import api from './api';

export default {
  /**
   * Ottiene tutti i materiali
   * @returns {Promise} Promise con la lista dei materiali
   */
  getAllMaterials() {
    return api.get('/api/materials');
  },

  /**
   * Ottiene un materiale specifico per ID
   * @param {string} id - ID del materiale
   * @returns {Promise} Promise con i dettagli del materiale
   */
  getMaterialById(id) {
    return api.get(`/api/materials/${id}`);
  },

  /**
   * Crea un nuovo materiale
   * @param {Object} material - Dati del materiale da creare
   * @returns {Promise} Promise con il materiale creato
   */
  createMaterial(material) {
    return api.post('/api/materials', material);
  },

  /**
   * Aggiorna un materiale esistente
   * @param {string} id - ID del materiale
   * @param {Object} material - Dati aggiornati del materiale
   * @returns {Promise} Promise con il materiale aggiornato
   */
  updateMaterial(id, material) {
    return api.put(`/api/materials/${id}`, material);
  },

  /**
   * Elimina un materiale
   * @param {string} id - ID del materiale
   * @returns {Promise} Promise vuota in caso di successo
   */
  deleteMaterial(id) {
    return api.delete(`/api/materials/${id}`);
  }
};