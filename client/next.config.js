/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
        domains: ['res.cloudinary.com'],
    },
}

module.exports = nextConfig
