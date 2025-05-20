/**
 * Theme Helper Utility
 * Provides consistent theme switching functionality across the application
 */

// Initialize the theme system - call this on app load
export function initializeTheme() {
  console.log('Initializing theme system');
  
  try {
    // Check localStorage first
    const savedTheme = localStorage.getItem('darkMode');
    // Then check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Determine which theme to use
    const shouldUseDarkMode = savedTheme === 'true' || (savedTheme === null && prefersDark);
    
    // Apply theme directly to HTML element
    applyTheme(shouldUseDarkMode);
    
    // Set up system preference listener
    setupSystemPreferenceListener();
    
    console.log('Theme initialized:', shouldUseDarkMode ? 'dark' : 'light');
    return shouldUseDarkMode;
  } catch (error) {
    console.error('Theme initialization error:', error);
    return false; // Default to light theme on error
  }
}

// Apply theme with transition effect
export function applyTheme(dark) {
  try {
    console.log('Applying theme:', dark ? 'dark' : 'light');
    
    // Add transition class to enable smooth transitions
    document.documentElement.classList.add('theme-transition');
    
    // Apply the theme
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    
    // Store the preference
    localStorage.setItem('darkMode', dark.toString());
    
    // Notify other parts of the application
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { isDark: dark } 
    }));
    
    // Remove transition class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 250); // Match the CSS transition duration
  } catch (error) {
    console.error('Error applying theme:', error);
  }
}

// Toggle current theme
export function toggleTheme() {
  try {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(!isDark);
    return !isDark;
  } catch (error) {
    console.error('Error toggling theme:', error);
    return false;
  }
}

// Get current theme
export function getCurrentTheme() {
  try {
    const isDark = document.documentElement.classList.contains('dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('darkMode');
    
    return {
      isDark,
      prefersDark,
      savedTheme,
      source: savedTheme !== null ? 'user' : 'system'
    };
  } catch (error) {
    console.error('Error getting current theme:', error);
    return { isDark: false, prefersDark: false, savedTheme: null, source: 'error' };
  }
}

// Reset to system preference
export function resetToSystemPreference() {
  try {
    localStorage.removeItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
    return prefersDark;
  } catch (error) {
    console.error('Error resetting theme:', error);
    return false;
  }
}

// Set up system preference listener
function setupSystemPreferenceListener() {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      console.log('System theme preference changed:', e.matches ? 'dark' : 'light');
      
      // Only apply if user hasn't set a preference
      if (localStorage.getItem('darkMode') === null) {
        applyTheme(e.matches);
      }
    };
    
    // Clean up old listener if it exists
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
    
    // Add new listener
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } catch (error) {
    console.error('Error setting up system preference listener:', error);
  }
}

// Create a floating theme toggle button for easy testing
export function createFloatingThemeToggle() {
  try {
    // Remove existing if any
    const existingButton = document.getElementById('floating-theme-toggle');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create button
    const button = document.createElement('button');
    button.id = 'floating-theme-toggle';
    button.innerHTML = '🌓';
    button.title = 'Toggle Theme';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      font-size: 24px;
      border: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    `;
    
    // Add hover effect
    button.onmouseover = () => {
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
    };
    
    // Add click handler
    button.onclick = () => {
      toggleTheme();
    };
    
    // Add to body
    document.body.appendChild(button);
    
    return button;
  } catch (error) {
    console.error('Error creating floating theme toggle:', error);
    return null;
  }
}

// Export all as a single object for easy console debugging
if (typeof window !== 'undefined') {
  window.themeHelper = {
    initialize: initializeTheme,
    apply: applyTheme,
    toggle: toggleTheme,
    get: getCurrentTheme,
    reset: resetToSystemPreference,
    addFloatingToggle: createFloatingThemeToggle
  };
} 