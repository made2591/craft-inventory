import api from './api';

export default {
  /**
   * Ottiene tutte le transazioni con paginazione
   * @param {Object} options - Opzioni di paginazione e filtri
   * @param {number} options.page - Numero di pagina
   * @param {number} options.limit - Elementi per pagina
   * @param {string} options.type - Tipo di transazione (opzionale)
   * @param {string} options.customerId - ID cliente (opzionale)
   * @param {string} options.supplierId - ID fornitore (opzionale)
   * @param {string} options.modelId - ID modello (opzionale)
   * @returns {Promise} Promise con la lista delle transazioni e info di paginazione
   */
  getAllTransactions(options = {}) {
    return api.get('/api/transactions', { params: options });
  },

  /**
   * Ottiene una transazione specifica per ID
   * @param {string} id - ID della transazione
   * @returns {Promise} Promise con i dettagli della transazione
   */
  getTransactionById(id) {
    return api.get(`/api/transactions/${id}`);
  },

  /**
   * Crea una nuova transazione
   * @param {Object} transaction - Dati della transazione da creare
   * @returns {Promise} Promise con la transazione creata
   */
  createTransaction(transaction) {
    return api.post('/api/transactions', transaction);
  },

  /**
   * Aggiorna una transazione esistente
   * @param {string} id - ID della transazione
   * @param {Object} transaction - Dati aggiornati della transazione
   * @returns {Promise} Promise con la transazione aggiornata
   */
  updateTransaction(id, transaction) {
    return api.put(`/api/transactions/${id}`, transaction);
  },

  /**
   * Elimina una transazione
   * @param {string} id - ID della transazione
   * @returns {Promise} Promise vuota in caso di successo
   */
  deleteTransaction(id) {
    return api.delete(`/api/transactions/${id}`);
  }
};