<template>
  <div class="action-menu" :class="{ 'open': isOpen }">
    <button 
      class="action-trigger" 
      @click="toggleMenu" 
      :class="{ 'active': isOpen }"
      :title="$t('common.actions')"
    >
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </button>
    
    <div class="action-dropdown" v-if="isOpen" @click.stop>
      <div class="action-list">
        <button 
          v-for="action in actions" 
          :key="action.key"
          class="action-item"
          :class="[action.variant || 'default', { 'disabled': action.disabled }]"
          @click="handleAction(action)"
          :disabled="action.disabled"
          :title="action.tooltip"
        >
          <i :class="action.icon" class="action-icon"></i>
          <span class="action-text">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionMenu',
  props: {
    actions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
    
    closeMenu() {
      this.isOpen = false;
    },
    
    handleAction(action) {
      if (!action.disabled) {
        this.$emit('action', action.key, action);
        this.closeMenu();
      }
    },
    
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.closeMenu();
      }
    }
  },  

  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.action-menu {
  position: relative;
  display: inline-block;
}

.action-trigger {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.2s ease;
  min-width: 32px;
  min-height: 32px;
}

.action-trigger:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-trigger.active {
  background: rgba(66, 185, 131, 0.1);
}

.dot {
  width: 4px;
  height: 4px;
  background: #6b7280;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-trigger:hover .dot,
.action-trigger.active .dot {
  background: var(--primary);
}

.action-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 180px;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-list {
  padding: 8px 0;
}

.action-item {
  width: 100%;
  background: none;
  border: none;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.action-item:hover {
  background: #f9fafb;
}

.action-item.primary {
  color: var(--primary);
}

.action-item.primary:hover {
  background: rgba(66, 185, 131, 0.1);
}

.action-item.danger {
  color: #ef4444;
}

.action-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.action-item.warning {
  color: #f59e0b;
}

.action-item.warning:hover {
  background: rgba(245, 158, 11, 0.1);
}

.action-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-item.disabled:hover {
  background: none;
}

.action-icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
}

.action-text {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .action-trigger {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
  }
  
  .dot {
    width: 5px;
    height: 5px;
  }
  
  .action-dropdown {
    min-width: 200px;
  }
  
  .action-item {
    padding: 16px;
    font-size: 16px;
  }
  
  .action-icon {
    font-size: 16px;
  }
}
</style>