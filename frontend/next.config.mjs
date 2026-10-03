/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://app:8000/api/:path*',
            },
        ];
    },
};

export default nextConfig;