<template>
  <div class="container">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-center">
        <i class="fas fa-cog mr-2"></i>
        {{ $t('settings.title') }}
      </h1>
    </div>

    <!-- Language Settings Card -->
    <div class="card">
      <div class="card-header">
        <h2 class="flex items-center gap-2">
          <i class="fas fa-language text-primary"></i>
          {{ $t('settings.languageSettings') }}
        </h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label for="language" class="form-label">
            <i class="fas fa-globe mr-2"></i>
            {{ $t('settings.selectLanguage') }}
          </label>
          <div class="select-wrapper">
            <select id="language" v-model="selectedLocale" @change="changeLanguage" class="form-select">
              <option value="it">🇮🇹 {{ $t('settings.italian') }}</option>
              <option value="en">🇺🇸 {{ $t('settings.english') }}</option>
            </select>
            <i class="fas fa-chevron-down select-icon"></i>
          </div>
        </div>

        <div class="language-preview">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-eye text-primary"></i>
            <h3>{{ $t('settings.languagePreview') }}</h3>
          </div>
          <p class="preview-text">{{ $t('dashboard.welcome') }}</p>
        </div>
      </div>
    </div>

    <!-- Theme Settings Card -->
    <div class="card">
      <div class="card-header">
        <h2 class="flex items-center gap-2">
          <i class="fas fa-palette text-primary"></i>
          {{ $t('settings.theme') }}
        </h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-brush mr-2"></i>
            {{ $t('settings.selectTheme') }}
          </label>
          <div class="theme-grid">
            <div class="theme-card" :class="{ active: selectedTheme === 'light' }" @click="selectTheme('light')">
              <div class="theme-preview light-theme">
                <div class="theme-header"></div>
                <div class="theme-content">
                  <div class="theme-line"></div>
                  <div class="theme-line short"></div>
                </div>
              </div>
              <div class="theme-info">
                <i class="fas fa-sun theme-icon"></i>
                <span class="theme-name">{{ $t('settings.lightTheme') }}</span>
              </div>
            </div>
            
            <div class="theme-card" :class="{ active: selectedTheme === 'dark' }" @click="selectTheme('dark')">
              <div class="theme-preview dark-theme">
                <div class="theme-header"></div>
                <div class="theme-content">
                  <div class="theme-line"></div>
                  <div class="theme-line short"></div>
                </div>
              </div>
              <div class="theme-info">
                <i class="fas fa-moon theme-icon"></i>
                <span class="theme-name">{{ $t('settings.darkTheme') }}</span>
              </div>
            </div>
            
            <div class="theme-card" :class="{ active: selectedTheme === 'system' }" @click="selectTheme('system')">
              <div class="theme-preview system-theme">
                <div class="theme-header"></div>
                <div class="theme-content">
                  <div class="theme-line"></div>
                  <div class="theme-line short"></div>
                </div>
              </div>
              <div class="theme-info">
                <i class="fas fa-desktop theme-icon"></i>
                <span class="theme-name">{{ $t('settings.systemTheme') }}</span>
              </div>
            </div>
          </div>
          <div class="note">
            <i class="fas fa-info-circle mr-2"></i>
            {{ $t('settings.themeNote') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <transition name="fade">
      <div v-if="showSuccessMessage" class="alert alert-success">
        <i class="fas fa-check-circle mr-2"></i>
        {{ $t('settings.settingsSaved') }}
      </div>
    </transition>
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
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border-light);
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  font-size: 12px;
}

.language-preview {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, var(--snow-dark) 0%, var(--border) 100%);
  border-radius: 12px;
  border-left: 4px solid var(--secondary);
  position: relative;
  overflow: hidden;
}

.language-preview::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(226, 132, 19, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.language-preview h3 {
  margin: 0 0 8px 0;
  color: var(--secondary);
  font-size: 1.1rem;
  font-weight: 600;
}

.preview-text {
  margin: 0;
  color: var(--text-secondary);
  font-style: italic;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.theme-card {
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--surface);
  position: relative;
  overflow: hidden;
}

.theme-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(226, 132, 19, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-card:hover {
  border-color: var(--secondary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(226, 132, 19, 0.15);
}

.theme-card:hover::before {
  opacity: 1;
}

.theme-card.active {
  border-color: var(--secondary);
  background: linear-gradient(135deg, var(--surface) 0%, var(--snow-dark) 100%);
  box-shadow: 0 4px 20px rgba(226, 132, 19, 0.2);
}

.theme-card.active::before {
  opacity: 1;
}

.theme-preview {
  height: 100px;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
}

.theme-header {
  height: 20px;
  width: 100%;
  border-radius: 8px 8px 0 0;
}

.theme-content {
  padding: 8px;
  height: calc(100% - 20px);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-line {
  height: 6px;
  border-radius: 3px;
  width: 100%;
}

.theme-line.short {
  width: 60%;
}

/* Light Theme Preview */
.light-theme {
  background-color: #ffffff;
}

.light-theme .theme-header {
  background-color: #f8fafc;
}

.light-theme .theme-line {
  background-color: #e2e8f0;
}

/* Dark Theme Preview */
.dark-theme {
  background-color: #1a202c;
}

.dark-theme .theme-header {
  background-color: #2d3748;
}

.dark-theme .theme-line {
  background-color: #4a5568;
}

/* System Theme Preview */
.system-theme {
  background: linear-gradient(to right, #ffffff 50%, #1a202c 50%);
}

.system-theme .theme-header {
  background: linear-gradient(to right, #f8fafc 50%, #2d3748 50%);
}

.system-theme .theme-line {
  background: linear-gradient(to right, #e2e8f0 50%, #4a5568 50%);
}

.theme-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.theme-icon {
  font-size: 18px;
  color: var(--secondary);
}

.theme-name {
  font-weight: 500;
  color: var(--text-primary);
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-muted);
  background-color: var(--snow-dark);
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid var(--secondary);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 24px;
  }
  
  .theme-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .theme-card {
    padding: 12px;
  }
  
  .theme-preview {
    height: 80px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .language-preview {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .theme-info {
    flex-direction: column;
    gap: 4px;
  }
  
  .theme-icon {
    font-size: 16px;
  }
  
  .theme-name {
    font-size: 0.875rem;
  }
}

/* Animation for theme selection */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.theme-card.active {
  animation: pulse 0.3s ease-out;
}

/* Accessibility improvements */
.theme-card:focus {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}

.form-select:focus {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .theme-preview {
    border: 2px solid #000 !important;
  }
  
  .theme-card.active {
    border: 3px solid #000 !important;
  }
}
</style>