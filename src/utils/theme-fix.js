/**
 * Theme Fix Utility
 * This script helps resolve edge cases with theme switching
 */

// Run immediately when script loads
(function() {
  if (typeof window === 'undefined') return;
  
  // Log initialization
  console.log('[Theme Fix] Initializing theme fix utility');
  
  try {
    // When DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      // Force a re-paint to fix any flickering
      console.log('[Theme Fix] DOM loaded, applying fixes');
      
      // 1. Add transition class to enable smooth transitions
      document.documentElement.classList.add('theme-transition');
      
      // 2. Force a browser repaint
      document.documentElement.style.backgroundColor = document.documentElement.style.backgroundColor;
      
      // 3. Remove transition class shortly after
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 50);
      
      // 4. Double-check dark/light class consistency
      const savedTheme = localStorage.getItem('darkMode');
      const isDark = document.documentElement.classList.contains('dark');
      const shouldBeDark = savedTheme === 'true';
      
      // If there's an inconsistency, fix it
      if (savedTheme !== null && isDark !== shouldBeDark) {
        console.log('[Theme Fix] Fixing theme inconsistency:', 
          { current: isDark ? 'dark' : 'light', shouldBe: shouldBeDark ? 'dark' : 'light' });
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    });
    
    // Setup mutation observer to monitor theme classes
    const setupClassObserver = () => {
      // Create observer instance
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const currentIsDark = document.documentElement.classList.contains('dark');
            console.log('[Theme Fix] HTML class changed, dark mode:', currentIsDark);
            
            // Make sure both data-theme and classList are synchronized
            document.documentElement.setAttribute('data-theme', currentIsDark ? 'dark' : 'light');
            
            // If React hasn't loaded yet, update the window.__theme global
            if (window.__theme) {
              window.__theme = currentIsDark ? 'dark' : 'light';
            }
          }
        });
      });
      
      // Start observing
      observer.observe(document.documentElement, { attributes: true });
      console.log('[Theme Fix] Class observer started');
    };
    
    // Set up observer when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupClassObserver);
    } else {
      setupClassObserver();
    }
    
    // Handle flashing during navigation
    window.addEventListener('beforeunload', () => {
      // Store the current theme directly in sessionStorage for immediate access
      // on the next page without flicker
      const isDark = document.documentElement.classList.contains('dark');
      sessionStorage.setItem('current_theme', isDark ? 'dark' : 'light');
    });
    
    // Expose theme fix functions globally
    window.themeFix = {
      forceRepaint: () => {
        // Use GPU rendering for smoother transitions
        document.documentElement.style.transform = 'translateZ(0)';
        
        // Force reflow/repaint
        void document.documentElement.offsetHeight;
        
        // Remove transform after repaint
        setTimeout(() => {
          document.documentElement.style.transform = '';
        }, 100);
      },
      
      resync: () => {
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'true' || (savedTheme === null && prefersDark);
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
        return shouldBeDark ? 'dark' : 'light';
      }
    };
    
    console.log('[Theme Fix] Theme fix utility loaded successfully');
  } catch (error) {
    console.error('[Theme Fix] Error in theme fix utility:', error);
  }
})(); 