import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['unzipper', '@libsql/client'],
};

export default nextConfig;
