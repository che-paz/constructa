/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Monorepo: incluir packages/ en el trace serverless (Vercel)
    outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
  },
};

export default nextConfig;
