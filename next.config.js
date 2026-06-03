/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Cesium — load from /public/cesium/Cesium.js (UMD global window.Cesium)
      // This avoids the "Octal escape sequences in template strings" strict-mode error
      // that occurs when webpack processes Cesium's GLSL shader source code.
      const existing = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];
      config.externals = [...existing, { cesium: "Cesium" }];

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
