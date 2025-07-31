<template>
  <div class="login-container">
    <div class="login-card">
      <h1>{{ isRegister ? $t('login.registerTitle') : $t('login.loginTitle') }}</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="username">{{ $t('login.username') }}</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            required
            autocomplete="username"
          />
        </div>
        
        <div v-if="isRegister" class="form-group">
          <label for="email">{{ $t('login.email') }}</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">{{ $t('login.password') }}</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required
            autocomplete="current-password"
          />
        </div>
        
        <div v-if="isRegister" class="form-group">
          <label for="confirmPassword">{{ $t('login.confirmPassword') }}</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="form.confirmPassword" 
            required
            autocomplete="new-password"
          />
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="loading"
          >
            {{ isRegister ? $t('login.registerButton') : $t('login.loginButton') }}
          </button>
          
          <div class="loading-spinner" v-if="loading"></div>
        </div>
      </form>
      
      <div class="toggle-form">
        <p v-if="isRegister">
          {{ $t('login.alreadyHaveAccount') }} 
          <a href="#" @click.prevent="isRegister = false">{{ $t('login.loginLink') }}</a>
        </p>
        <p v-else>
          {{ $t('login.noAccount') }} 
          <a href="#" @click.prevent="isRegister = true">{{ $t('login.registerLink') }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'LoginView',
  data() {
    return {
      isRegister: false,
      loading: false,
      error: null,
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    async submitForm() {
      this.error = null;
      
      // Validazione
      if (this.isRegister) {
        if (this.form.password !== this.form.confirmPassword) {
          this.error = this.$t('errors.passwordsMismatch');
          return;
        }
        
        if (this.form.password.length < 6) {
          this.error = this.$t('errors.passwordTooShort');
          return;
        }
      }
      
      this.loading = true;
      
      try {
        let response;
        
        if (this.isRegister) {
          // Registrazione
          response = await api.post('/api/auth/register', {
            username: this.form.username,
            email: this.form.email,
            password: this.form.password
          });
        } else {
          // Login
          response = await api.post('/api/auth/login', {
            username: this.form.username,
            password: this.form.password
          });
        }
        
        // Salva il token e i dati utente
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Imposta il token per le richieste future
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Reindirizza alla home
        this.$router.push('/');
      } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.response && error.response.data) {
          this.error = error.response.data;
        } else {
          this.error = this.$t('errors.authenticationError');
        }
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    // Controlla se l'utente è già autenticato
    const token = localStorage.getItem('token');
    if (token) {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 34, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  color: var(--primary);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--surface);
}

.form-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 16px;
  font-weight: bold;
}

.btn-primary {
  background-color: var(--secondary);
  color: var(--surface);
  width: 100%;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: var(--rusty-red-light);
  color: var(--danger);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.toggle-form {
  margin-top: 20px;
  text-align: center;
}

.toggle-form a {
  color: var(--secondary);
  text-decoration: none;
  font-weight: bold;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(251, 245, 243, 0.3);
  border-radius: 50%;
  border-top-color: var(--surface);
  animation: spin 1s ease-in-out infinite;
  margin-left: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>