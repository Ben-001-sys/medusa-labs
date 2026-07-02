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
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/brand"
    },
  // {
  //   resolve: "@medusajs/medusa/event-bus-redis",
  //   options: {
  //     redisUrl: process.env.EVENTS_REDIS_URL,
  //   },
  // },
 {
      resolve: "./src/modules/delivery-slot",
    },
        {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
          // {
          //   resolve: "@medusajs/medusa/notification-local",
          //   id: "local",
          //   options: {
          //     channels: ["email", "feed"],
          //   },
          // }
        ],
      },
    },
    {
      resolve: "./src/modules/pim-connector",
    },
    {
      resolve: "./src/modules/restock",
    },
  ],
  // featureFlags: {
  //   caching: true,
  // },
})
