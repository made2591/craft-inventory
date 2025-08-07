module.exports = {
  "extends": ["eslint:recommended", "@vue/eslint-config-typescript"],
  "rules": {
    // Security-focused ESLint rules
    
    // Prevent dangerous patterns
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-alert": "error",
    
    // Prevent potential XSS
    "no-unsanitized/method": "error",
    "no-unsanitized/property": "error",
    
    // Prevent prototype pollution
    "no-prototype-builtins": "error",
    "no-extend-native": "error",
    
    // Prevent information disclosure
    "no-console": "warn",
    "no-debugger": "error",
    
    // Prevent potential injection attacks
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error",
    
    // Vue.js specific security rules
    "vue/no-v-html": "error",
    "vue/no-v-text-v-html-on-component": "error",
    "vue/require-v-for-key": "error",
    "vue/no-use-v-if-with-v-for": "error",
    
    // Best practices for security
    "strict": ["error", "global"],
    "no-var": "error",
    "prefer-const": "error",
    "no-global-assign": "error",
    "no-implicit-globals": "error"
  },
  "plugins": [
    "security",
    "no-unsanitized"
  ],
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  }
};
