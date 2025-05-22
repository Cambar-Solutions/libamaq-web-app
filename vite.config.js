import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import viteImagemin from 'vite-plugin-imagemin'
import compression from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Optimización de imágenes
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.7, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      },
      webp: {
        quality: 80
      }
    }),
    // Compresión de archivos
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240 // Solo comprimir archivos mayores a 10KB
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
    
  },
  server: {
    allowedHosts: ["shore-questionnaire-response-hu.trycloudflare.com"]
  },
  
  // Configuración de build optimizada
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Eliminar console.log en producción
        drop_debugger: true // Eliminar debugger en producción
      },
      output: {
        comments: false      // Eliminar comentarios
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependencias grandes en chunks separados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'swiper', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query']
        },
        // Limitar el tamaño de los chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Generar sourcemaps solo en desarrollo
    sourcemap: process.env.NODE_ENV !== 'production'
  }
})
