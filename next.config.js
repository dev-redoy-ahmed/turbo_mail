/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://206.189.158.244:5000/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig