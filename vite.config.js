/**
 * ===== VITE CONFIGURATION FOR JAMCAMPING =====
 * 
 * This configuration file sets up Vite (the build tool) for the JamCamping project.
 * Vite is a modern, fast build tool that provides excellent development experience
 * and optimized production builds.
 * 
 * KEY FEATURES CONFIGURED:
 * - Source directory structure (src/ for development files)
 * - Public assets handling (images, fonts, etc.)
 * - Build output optimization and file naming
 * - Development server with hot reload
 * - Production build optimizations
 * - Asset organization and caching strategies
 * 
 * WHY VITE:
 * - Lightning-fast hot module replacement (HMR) during development
 * - Optimized production builds with code splitting
 * - Native ES modules support
 * - Excellent TypeScript support (if needed later)
 * - Plugin ecosystem for extending functionality
 * - Built-in CSS preprocessing and optimization
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Terser minification for smaller JavaScript bundles
 * - Asset file naming with hashes for optimal caching
 * - Code splitting for better loading performance
 * - Tree shaking to remove unused code
 * - Source map generation control for debugging vs. size
 * 
 * @version 1.0.0
 * @requires vite ^5.0.0
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  /**
   * ROOT DIRECTORY CONFIGURATION
   * 
   * Sets the source directory to 'src' instead of the default project root.
   * This keeps source files organized and separate from configuration files.
   */
  root: 'src',
  
  /**
   * BASE PATH CONFIGURATION
   * 
   * Sets the base public path for the application.
   * '/' means the app will be served from the domain root.
   * Change this if deploying to a subdirectory (e.g., '/jamcamping/').
   */
  base: '/',
  
  /**
   * PUBLIC DIRECTORY CONFIGURATION
   * 
   * Points to the public assets directory relative to the root.
   * Files in this directory are copied directly to the build output
   * without processing (images, fonts, favicon, etc.).
   */
  publicDir: '../public',
  
  /**
   * BUILD CONFIGURATION
   * 
   * Comprehensive build settings for production optimization.
   */
  build: {
    /**
     * OUTPUT DIRECTORY
     * 
     * Specifies where the built files should be placed.
     * '../dist' puts the build output in the project root's dist folder.
     */
    outDir: '../dist',
    
    /**
     * EMPTY OUTPUT DIRECTORY
     * 
     * Clears the output directory before each build to ensure
     * no stale files remain from previous builds.
     */
    emptyOutDir: true,
    
    /**
     * ROLLUP OPTIONS
     * 
     * Advanced configuration for the underlying Rollup bundler.
     * Controls how files are processed and named in the final build.
     */
    rollupOptions: {
      /**
       * INPUT CONFIGURATION
       * 
       * Defines the entry points for the application.
       * Multiple entry points can be specified for complex applications.
       */
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      
      /**
       * OUTPUT CONFIGURATION
       * 
       * Controls how built files are named and organized.
       * Proper naming enables optimal browser caching strategies.
       */
      output: {
        /**
         * ASSET FILE NAMING
         * 
         * Custom function to organize different asset types into folders.
         * This improves build output organization and CDN efficiency.
         * 
         * NAMING STRATEGY:
         * - Images: /images/[name]-[hash][ext] (for browser caching)
         * - Fonts: /fonts/[name]-[hash][ext] (for browser caching)
         * - Other assets: /assets/[name]-[hash][ext] (fallback)
         * 
         * Hash in filename enables aggressive caching since filename
         * changes when content changes, forcing cache invalidation.
         */
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          // Image files go to images directory
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          
          // Font files go to fonts directory
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          
          // Everything else goes to assets directory
          return `assets/[name]-[hash][extname]`;
        },
        
        /**
         * CHUNK FILE NAMING
         * 
         * Names for JavaScript chunks created by code splitting.
         * Hash ensures proper cache invalidation when code changes.
         */
        chunkFileNames: 'js/[name]-[hash].js',
        
        /**
         * ENTRY FILE NAMING
         * 
         * Names for main JavaScript entry files.
         * Hash ensures proper cache invalidation when code changes.
         */
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    
    /**
     * MINIFICATION CONFIGURATION
     * 
     * Uses Terser for JavaScript minification in production builds.
     * Terser provides excellent compression while maintaining compatibility.
     */
    minify: 'terser',
    
    /**
     * TERSER OPTIONS
     * 
     * Advanced minification settings for optimal file size.
     * Removes development-only code for production builds.
     */
    terserOptions: {
      compress: {
        /**
         * REMOVE CONSOLE STATEMENTS
         * 
         * Strips console.log and similar statements from production builds.
         * Reduces file size and prevents debug output in production.
         */
        drop_console: true,
        
        /**
         * REMOVE DEBUGGER STATEMENTS
         * 
         * Removes debugger statements that could cause issues in production.
         */
        drop_debugger: true
      }
    },
    
    /**
     * SOURCE MAP CONFIGURATION
     * 
     * Controls generation of source maps for debugging.
     * Set to false for production to reduce build size.
     * Set to true or 'inline' for development debugging.
     */
    sourcemap: false,
    
    /**
     * TARGET BROWSER CONFIGURATION
     * 
     * Specifies the minimum browser version to support.
     * ES2015 provides good modern browser support while maintaining compatibility.
     * 
     * BROWSER SUPPORT:
     * - Chrome 51+ (2016)
     * - Firefox 54+ (2017)
     * - Safari 10+ (2016)
     * - Edge 15+ (2017)
     */
    target: 'es2015'
  },
  
  /**
   * DEVELOPMENT SERVER CONFIGURATION
   * 
   * Settings for the local development server that runs during development.
   */
  server: {
    /**
     * PORT CONFIGURATION
     * 
     * Sets the development server port to 3000.
     * Consistent port makes development workflow predictable.
     */
    port: 3000,
    
    /**
     * HOST CONFIGURATION
     * 
     * Allows connections from any IP address.
     * Enables testing on mobile devices and other machines on the network.
     */
    host: true,
    
    /**
     * AUTO-OPEN BROWSER
     * 
     * Automatically opens the default browser when the dev server starts.
     * Improves developer experience by reducing manual steps.
     */
    open: true
  },
  
  /**
   * PREVIEW SERVER CONFIGURATION
   * 
   * Settings for the preview server that serves production builds locally.
   * Useful for testing production builds before deployment.
   */
  preview: {
    port: 3000,
    host: true
  },
  
  /**
   * DEPENDENCY OPTIMIZATION
   * 
   * Controls how Vite handles dependencies during development.
   * Pre-bundling dependencies improves development server performance.
   */
  optimizeDeps: {
    /**
     * INCLUDE DEPENDENCIES
     * 
     * Forces specific dependencies to be pre-bundled.
     * Useful for dependencies that don't work well with Vite's auto-detection.
     */
    include: ['workbox-window']
  }
});
