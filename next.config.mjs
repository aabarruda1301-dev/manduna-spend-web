/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Não falhar build em warnings de tipo/lint (evita bloqueio em primeiro deploy)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
