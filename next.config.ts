import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Agent runs pass uploaded prints (data URLs) through a Server Action.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
