import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({

  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },

  projectConfig: {
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },

  modules: [
    // {
    //   resolve: "@medusajs/medusa/caching",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/caching-redis",
    //         id: "caching-redis",
    //         is_default: true,
    //         options: {
    //           redisUrl: process.env.REDIS_URL,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/event-bus-redis",
    //   options: {
    //     redisUrl: process.env.REDIS_URL,
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/workflow-engine-redis",
    //   options: {
    //     redis: {
    //       redisUrl: process.env.REDIS_URL,
    //     },
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/locking",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/locking-redis",
    //         id: "locking-redis",
    //         is_default: true,
    //         options: {
    //           redisUrl: process.env.REDIS_URL,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/analytics",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/analytics-posthog",
    //         id: "posthog",
    //         options: {
    //           posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
    //           posthogHost: process.env.POSTHOG_HOST,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/file",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/file-s3",
    //         id: "s3",
    //         options: {
    //           file_url: process.env.S3_FILE_URL,
    //           access_key_id: process.env.S3_ACCESS_KEY_ID,
    //           secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
    //           region: process.env.S3_REGION,
    //           bucket: process.env.S3_BUCKET,
    //           endpoint: process.env.S3_ENDPOINT,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/notification",
    //   options: {
    //     providers: [
    //       // ...
    //       {
    //         resolve: "@medusajs/medusa/notification-sendgrid",
    //         id: "sendgrid",
    //         options: {
    //           channels: ["email"],
    //           api_key: process.env.SENDGRID_API_KEY,
    //           from: process.env.SENDGRID_FROM,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "@medusajs/medusa/payment",
    //   options: {
    //     providers: [
    //       {
    //         resolve: "@medusajs/medusa/payment-stripe",
    //         id: "stripe",
    //         options: {
    //           apiKey: process.env.STRIPE_API_KEY,
    //         },
    //       },
    //     ],
    //   },
    // },
    // {
    //   resolve: "./src/modules/invoice-generator",
    // },
    // {
    //   resolve: "./src/modules/product-review",
    // },
    // {
    //   resolve: "./src/modules/brand",
    // },
    // {
    //   resolve: "./modules/strapi",
    //   options: {
    //     apiUrl: process.env.STRAPI_API_URL,
    //     apiToken: process.env.STRAPI_API_TOKEN,
    //     defaultLocale: process.env.STRAPI_DEFAULT_LOCALE || "en",
    //   },
    // },
  ],
  // featureFlags: {
  //   caching: true,
  // },
    {
      resolve: "./src/modules/brand"
    }
  ]
})
