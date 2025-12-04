import type { NextConfig } from "next";

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
                protocol: "https",
                hostname: "placehold.co",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
    // Performance optimizations
    poweredByHeader: false,
    compress: true,
    experimental: {
        optimizePackageImports: ["lucide-react", "@/components/ui"],
    },
    turbopack: {
        resolveAlias: {
            underscore: "lodash",
            mocha: { browser: "mocha/browser-entry.js" },
        },
    },
    webpack: (config, { dev, isServer }) => {
        // Optimize for faster builds
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: "all",
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        priority: 10,
                        enforce: true,
                    },
                },
            };
        }
        return config;
    },
};

export default nextConfig;
