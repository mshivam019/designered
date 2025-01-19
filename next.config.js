/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
    experimental: {
        reactCompiler: true
    },

    images: {
        remotePatterns: [
            {
                hostname: 'images.unsplash.com'
            },
            {
                hostname: 'source.unsplash.com'
            },
            {
                hostname: 'utfs.io'
            }
        ]
    },
    webpack: (config, { webpack }) => {
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^pg-native$|^cloudflare:sockets$/
            })
        );
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            bufferutil: 'commonjs bufferutil',
            canvas: 'commonjs canvas'
        });
        return config;
    }
};

export default config;
