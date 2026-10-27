const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  compress: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
  experimental: { optimizePackageImports: ['@react-three/drei', 'gsap'] },
  async headers() {
    return ['models', 'earth', 'phones', 'careers', 'fonts'].map((d) => ({ source: `/${d}/:path*`, headers: immutable }));
  },
};
export default nextConfig;
