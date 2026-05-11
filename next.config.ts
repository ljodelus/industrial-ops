import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Replace 'industrial-ops-ui' with your actual GitHub repository name
const repoName = "industrial-ops-ui";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
