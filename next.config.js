// /**
//  * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
//  * for Docker builds.
//  */
// import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["images.unsplash.com", "ik.imagekit.io", "tailark.com", "randomuser.me"],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'x-user-id',
            value: '', // This will be set by your auth middleware
          },
        ],
      },
    ];
  },
};

export default config;
