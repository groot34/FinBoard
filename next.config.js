/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization since we're using custom server
  // This ensures pages are always server-rendered
  output: undefined,
  
  // Enable experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Webpack configuration for custom server
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    return config;
  },
  
  // Allow custom server
  distDir: '.next',
}

export default nextConfig;
