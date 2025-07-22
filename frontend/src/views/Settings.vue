<template>
  <div class="settings-page">
    <h1>{{ $t('settings.title') }}</h1>

    <div class="card">
      <div class="card-header">
        <h2>{{ $t('settings.languageSettings') }}</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label for="language">{{ $t('settings.selectLanguage') }}</label>
          <select id="language" v-model="selectedLocale" @change="changeLanguage">
            <option value="it">{{ $t('settings.italian') }}</option>
            <option value="en">{{ $t('settings.english') }}</option>
          </select>
        </div>

        <div class="language-preview">
          <h3>{{ $t('settings.languagePreview') }}</h3>
          <p>{{ $t('dashboard.welcome') }}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>{{ $t('settings.theme') }}</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>{{ $t('settings.selectTheme') }}</label>
          <div class="theme-options">
            <div class="theme-option" :class="{ active: selectedTheme === 'light' }" @click="selectTheme('light')">
              <div class="theme-preview light-theme"></div>
              <span>{{ $t('settings.lightTheme') }}</span>
            </div>
            <div class="theme-option" :class="{ active: selectedTheme === 'dark' }" @click="selectTheme('dark')">
              <div class="theme-preview dark-theme"></div>
              <span>{{ $t('settings.darkTheme') }}</span>
            </div>
            <div class="theme-option" :class="{ active: selectedTheme === 'system' }" @click="selectTheme('system')">
              <div class="theme-preview system-theme"></div>
              <span>{{ $t('settings.systemTheme') }}</span>
            </div>
          </div>
          <p class="note">{{ $t('settings.themeNote') }}</p>
        </div>
      </div>
    </div>

    <div v-if="showSuccessMessage" class="alert alert-success">
      {{ $t('settings.settingsSaved') }}
    </div>
  </div>
</template>

<script>
import { setLocale } from '../i18n';

export default {
  name: 'Settings',
  data() {
    return {
      selectedLocale: localStorage.getItem('locale') || 'it',
      selectedTheme: localStorage.getItem('theme') || 'light',
      showSuccessMessage: false
    };
  },
  methods: {
    changeLanguage() {
      setLocale(this.selectedLocale);
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    },
    selectTheme(theme) {
      this.selectedTheme = theme;
      localStorage.setItem('theme', theme);

      // Applica il tema
      document.documentElement.setAttribute('data-theme', theme);

      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }
  },
  mounted() {
    // Applica il tema corrente
    document.documentElement.setAttribute('data-theme', this.selectedTheme);
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.card-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #fff;
}

.language-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.language-preview h3 {
  margin-top: 0;
  color: #42b983;
}

.theme-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.theme-option {
  width: 120px;
  text-align: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.theme-option:hover {
  background-color: #f0f0f0;
}

.theme-option.active {
  background-color: #e3f2fd;
  border: 1px solid #42b983;
}

.theme-preview {
  height: 80px;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
}

.light-theme {
  background-color: #ffffff;
  position: relative;
}

.light-theme::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 2px;
}

.dark-theme {
  background-color: #333333;
  position: relative;
}

.dark-theme::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 10px;
  background-color: #555555;
  border-radius: 2px;
}

.system-theme {
  background: linear-gradient(to right, #ffffff 50%, #333333 50%);
  position: relative;
}

.system-theme::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 10px;
  background: linear-gradient(to right, #f0f0f0 50%, #555555 50%);
  border-radius: 2px;
}

.note {
  font-size: 0.9em;
  color: #666;
  margin-top: 10px;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>