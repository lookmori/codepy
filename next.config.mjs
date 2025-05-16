/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: "postgres://neondb_owner:npg_RaI36UTENywY@ep-frosty-silence-a4f1obng-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
  }
};

export default nextConfig;
