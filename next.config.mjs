/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    // Add remotePatterns for external image hosts if needed, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "your-cdn.com", pathname: "/**" }],
  },
}

export default nextConfig
