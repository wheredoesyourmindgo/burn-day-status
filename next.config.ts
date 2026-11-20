import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // Tailwind's Turbopack loader, in place of PostCSS.
      '*.css': {loaders: ['@tailwindcss/turbopack']}
    }
  }
}

export default nextConfig
