/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.0.109"],
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_BACKEND_INTERNAL_URL || "http://127.0.0.1:4000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: "/socket.io/:path*",
        destination: `${backendUrl}/socket.io/:path*`
      }
    ];
  }
};

export default nextConfig;
