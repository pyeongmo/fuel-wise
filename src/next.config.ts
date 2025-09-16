import 'dotenv/config';
import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    //
    // Fix for:
    // require.extensions is not supported by webpack. Use a loader instead.
    //
    // https://github.com/firebase/genkit/issues/118#issuecomment-2222336814
    //
    config.externals.push('wasabi-express');
    config.resolve.alias = {
      ...config.resolve.alias,
      'node-fetch': false,
      'util': false,
    };
    return config
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
