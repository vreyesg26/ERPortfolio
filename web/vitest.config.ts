import {defineConfig} from 'vitest/config'

// Vitest no carga .env.local solo; las pruebas en vivo leen el dataset real.
try {
  process.loadEnvFile('.env.local')
} catch {
  // Sin .env.local (CI): sanity.ts avisa con console.error y las pruebas en vivo fallan.
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
