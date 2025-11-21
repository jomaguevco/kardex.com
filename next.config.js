/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'kardexaplicacion.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kardexaplicacion.up.railway.app',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api',
  },
  // Usando API route handler en lugar de rewrites para mejor control
  // async rewrites() {
  //   // Proxy para evitar problemas de CORS en desarrollo local
  //   // Si estamos en desarrollo local y la URL apunta a Railway, usar proxy
  //   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
  //   const isRailwayBackend = apiUrl.includes('railway.app');
  //   
  //   if (isRailwayBackend) {
  //     return [
  //       {
  //         source: '/api-proxy/:path*',
  //         destination: `${apiUrl}/:path*`,
  //       },
  //     ]
  //   }
  //   
  //   return []
  // },
}

module.exports = nextConfig