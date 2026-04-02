/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "booktracker",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Defines external Postgres DB URL and JWT secret via SST secrets
    const databaseUrl = new sst.Secret("DATABASE_URL");
    const jwtSecret = new sst.Secret("JWT_SECRET");

    // The NestJS backend serverless function
    const api = new sst.aws.Function("Api", {
      handler: "apps/api/dist/main.handler",
      environment: {
        DATABASE_URL: databaseUrl.value,
        JWT_SECRET: jwtSecret.value,
        NODE_ENV: "production",
      },
      // Since Nest.js relies on decorators and precise metadata during DI and TypeORM resolving,
      // it is safer to rely on the pre-built dist output instead of SST's esbuild bundler 
      // tearing through TS files natively, as decorators can occasionally get mangled.
      // Make sure `pnpm --filter api build` is run before deploying.
      copyFiles: [
        { from: "apps/api/dist", to: "apps/api/dist" },
        { from: "apps/api/node_modules", to: "apps/api/node_modules" },
      ],
      // We instruct SST that we supply our own modules/dist for this function
      nodejs: {
        install: [], 
      }
    });

    // The Next.js frontend
    const web = new sst.aws.Nextjs("Web", {
      path: "apps/web",
      environment: {
        // Point Next.js API requests to our newly deployed Serverless Nest.js API
        NEXT_PUBLIC_API_URL: api.url,
      },
    });

    return {
      ApiUrl: api.url,
      WebUrl: web.url,
    };
  },
});
