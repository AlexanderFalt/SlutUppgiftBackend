import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), '')

  const localDevTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return defineConfig({
    plugins: [react()],

    ...(mode === 'development' && {
      server: {
        proxy: {
          '/api': {
            target: localDevTarget,
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': {
            target: localDevTarget,
            ws: true,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    }),
  })
}