/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{
      source: '/',
      headers: [
        {
          key: 'Permissions-Policy',
          value: 'autoplay=(self)'
        }
      ]
    }]
  }
};

export default nextConfig;
