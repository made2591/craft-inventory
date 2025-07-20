import api from './api';

export default {
  /**
   * Ottiene tutte le transazioni
   * @returns {Promise} Promise con la lista delle transazioni
   */
  getAllTransactions() {
    return api.get('/api/transactions');
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