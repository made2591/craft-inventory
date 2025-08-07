<template>
  <div class="welcome-container">
    <!-- Header Section -->
    <div class="welcome-header">
      <div class="welcome-icon">
        <i class="fas fa-tools"></i>
      </div>
      <h1 class="welcome-title">{{ $t('welcome.title') }}</h1>
      <p class="welcome-subtitle">{{ $t('welcome.subtitle') }}</p>
    </div>

    <!-- Main Content -->
    <div class="welcome-content">
      <!-- Application Description -->
      <section class="info-section">
        <div class="section-header">
          <i class="fas fa-info-circle"></i>
          <h2>{{ $t('welcome.aboutApp.title') }}</h2>
        </div>
        <div class="section-content">
          <p>{{ $t('welcome.aboutApp.description') }}</p>
          <div class="features-grid">
            <div class="feature-item">
              <i class="fas fa-warehouse"></i>
              <span>{{ $t('welcome.aboutApp.features.inventory') }}</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-box"></i>
              <span>{{ $t('welcome.aboutApp.features.materials') }}</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-cogs"></i>
              <span>{{ $t('welcome.aboutApp.features.components') }}</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-cubes"></i>
              <span>{{ $t('welcome.aboutApp.features.products') }}</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>{{ $t('welcome.aboutApp.features.contacts') }}</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-exchange-alt"></i>
              <span>{{ $t('welcome.aboutApp.features.transactions') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Kiosk Mode Information -->
      <section class="info-section kiosk-section">
        <div class="section-header">
          <i class="fas fa-tv"></i>
          <h2>{{ $t('welcome.kioskMode.title') }}</h2>
        </div>
        <div class="section-content">
          <div class="kiosk-status" v-if="kioskStatus">
            <div class="status-badge" :class="{ 'active': kioskStatus.kioskMode }">
              <i class="fas fa-circle"></i>
              {{ kioskStatus.kioskMode ? $t('welcome.kioskMode.active') : $t('welcome.kioskMode.inactive') }}
            </div>
            <div class="reset-info" v-if="kioskStatus.kioskMode">
              <p class="reset-interval">
                <i class="fas fa-clock"></i>
                {{ $t('welcome.kioskMode.resetInterval', { interval: kioskStatus.resetIntervalMinutes }) }}
              </p>
            </div>
          </div>
          
          <div class="kiosk-explanation">
            <h3>{{ $t('welcome.kioskMode.whatIs.title') }}</h3>
            <p>{{ $t('welcome.kioskMode.whatIs.description') }}</p>
            
            <div class="kiosk-features">
              <div class="kiosk-feature">
                <i class="fas fa-sync-alt"></i>
                <div>
                  <strong>{{ $t('welcome.kioskMode.features.autoReset.title') }}</strong>
                  <p>{{ $t('welcome.kioskMode.features.autoReset.description') }}</p>
                </div>
              </div>
              <div class="kiosk-feature">
                <i class="fas fa-database"></i>
                <div>
                  <strong>{{ $t('welcome.kioskMode.features.freshData.title') }}</strong>
                  <p>{{ $t('welcome.kioskMode.features.freshData.description') }}</p>
                </div>
              </div>
              <div class="kiosk-feature">
                <i class="fas fa-shield-alt"></i>
                <div>
                  <strong>{{ $t('welcome.kioskMode.features.safeDemo.title') }}</strong>
                  <p>{{ $t('welcome.kioskMode.features.safeDemo.description') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Demo Notice -->
      <section class="info-section demo-notice">
        <div class="section-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h2>{{ $t('welcome.demo.title') }}</h2>
        </div>
        <div class="section-content">
          <div class="warning-box">
            <div class="warning-item">
              <i class="fas fa-info-circle"></i>
              <span>{{ $t('welcome.demo.isDemo') }}</span>
            </div>
            <div class="warning-item">
              <i class="fas fa-times-circle"></i>
              <span>{{ $t('welcome.demo.noGuarantee') }}</span>
            </div>
            <div class="warning-item">
              <i class="fas fa-edit"></i>
              <span>{{ $t('welcome.demo.canChange') }}</span>
            </div>
            <div class="warning-item">
              <i class="fas fa-hand-paper"></i>
              <span>{{ $t('welcome.demo.dontStress') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Getting Started -->
      <section class="info-section getting-started">
        <div class="section-header">
          <i class="fas fa-rocket"></i>
          <h2>{{ $t('welcome.gettingStarted.title') }}</h2>
        </div>
        <div class="section-content">
          <p>{{ $t('welcome.gettingStarted.description') }}</p>
          <div class="action-buttons">
            <router-link to="/materials" class="btn btn-primary">
              <i class="fas fa-box"></i>
              {{ $t('welcome.gettingStarted.viewMaterials') }}
            </router-link>
            <router-link to="/components" class="btn btn-secondary">
              <i class="fas fa-cogs"></i>
              {{ $t('welcome.gettingStarted.viewComponents') }}
            </router-link>
            <router-link to="/inventory" class="btn btn-secondary">
              <i class="fas fa-warehouse"></i>
              {{ $t('welcome.gettingStarted.viewInventory') }}
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  data() {
    return {
      // Use build-time configuration for kiosk mode
      kioskStatus: {
        enabled: true,
        kioskMode: typeof __KIOSK_MODE__ !== 'undefined' ? __KIOSK_MODE__ : false,
        resetInterval: 15,
        nextReset: 'Unknown'
      },
      timeUntilReset: null,
      updateInterval: null
    };
  },
  mounted() {
    if (this.kioskStatus.kioskMode) {
      this.startTimer();
    }
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
  methods: {
    updateTimeUntilReset() {
      if (!this.kioskStatus?.kioskMode) {
        return;
      }

      // Since we don't have real-time data, show a generic message
      this.timeUntilReset = this.$t('welcome.kioskMode.resetInterval', { 
        interval: this.kioskStatus.resetIntervalMinutes 
      });
    },
    
    startTimer() {
      // Update the timer display
      this.updateTimeUntilReset();
      
      // Update every 30 seconds for demo purposes
      this.updateInterval = setInterval(() => {
        this.updateTimeUntilReset();
      }, 30000);
    }
  }
};
</script>

<style scoped>
.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, var(--oxford-blue) 0%, var(--oxford-blue-light) 100%);
  border-radius: 12px;
  color: var(--snow);
}

.welcome-icon {
  font-size: 4rem;
  color: var(--fulvous);
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.welcome-content {
  display: grid;
  gap: 30px;
}

.info-section {
  background: var(--snow);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--fulvous);
}

.section-header i {
  font-size: 1.5rem;
  color: var(--fulvous);
}

.section-header h2 {
  margin: 0;
  color: var(--oxford-blue);
  font-size: 1.4rem;
}

.section-content {
  color: var(--text);
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: var(--fulvous-lighter);
  border-radius: 8px;
  border-left: 4px solid var(--fulvous);
}

.feature-item i {
  font-size: 1.2rem;
  color: var(--fulvous);
  min-width: 20px;
}

.kiosk-section {
  background: linear-gradient(135deg, var(--fulvous-lighter) 0%, var(--snow) 100%);
}

.kiosk-status {
  margin-bottom: 25px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  background: var(--oxford-blue-muted);
  color: var(--snow);
}

.status-badge.active {
  background: var(--success);
}

.status-badge i {
  font-size: 0.8rem;
}

.reset-info {
  background: var(--snow);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--fulvous);
}

.reset-interval, .next-reset {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-weight: 500;
}

.reset-interval i, .next-reset i {
  color: var(--fulvous);
}

.kiosk-features {
  margin-top: 20px;
}

.kiosk-feature {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);
}

.kiosk-feature:last-child {
  border-bottom: none;
}

.kiosk-feature i {
  font-size: 1.2rem;
  color: var(--fulvous);
  margin-top: 2px;
  min-width: 20px;
}

.kiosk-feature strong {
  color: var(--oxford-blue);
}

.demo-notice {
  background: linear-gradient(135deg, var(--danger-transparent) 0%, var(--snow) 100%);
}

.warning-box {
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--snow);
  border-radius: 8px;
  border-left: 4px solid var(--danger);
}

.warning-item i {
  color: var(--danger);
  font-size: 1.1rem;
  min-width: 20px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: var(--fulvous);
  color: var(--snow);
}

.btn-primary:hover {
  background: var(--fulvous-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(226, 132, 19, 0.3);
}

.btn-secondary {
  background: var(--oxford-blue-muted);
  color: var(--snow);
}

.btn-secondary:hover {
  background: var(--oxford-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .welcome-container {
    padding: 15px;
  }
  
  .welcome-header {
    padding: 30px 15px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .info-section {
    padding: 20px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>
