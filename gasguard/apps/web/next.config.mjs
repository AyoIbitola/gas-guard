/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@gasguard/core"],
  output: "standalone",
  experimental: {
    optimizeFonts: false,
  },
};

export default nextConfig;
