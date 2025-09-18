/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      '3f8286f8b2a5.ngrok-free.app', // Your ngrok domain
    ],
  },
}

module.exports = nextConfig