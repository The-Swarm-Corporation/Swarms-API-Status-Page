/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure CSS is included in production builds
  productionBrowserSourceMaps: false,
  // Ensure assets are served correctly
  assetPrefix: '',
  basePath: '',
};

export default nextConfig;
