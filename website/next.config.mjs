import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyGameSrc = path.join(__dirname, "legacy-game", "src");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.0.109"],
  poweredByHeader: false,
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      assets: path.join(legacyGameSrc, "assets"),
      context: path.join(legacyGameSrc, "context"),
      prefabs: path.join(legacyGameSrc, "prefabs"),
      query: path.join(legacyGameSrc, "query"),
      scenes: path.join(legacyGameSrc, "scenes"),
      scripts: path.join(legacyGameSrc, "scripts"),
      shared: path.join(legacyGameSrc, "shared")
    };
    config.module.rules.push({
      test: /\.(ttf|otf|eot|woff|woff2|mp3|m4a|wav)$/i,
      type: "asset/resource"
    });

    return config;
  },
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
