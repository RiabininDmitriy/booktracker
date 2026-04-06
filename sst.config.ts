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
      runtime: "nodejs20.x",
      url: {
        cors: false,
      },
      environment: {
        DATABASE_URL: databaseUrl.value,
        JWT_SECRET: jwtSecret.value,
        NODE_ENV: "production",
      },
      copyFiles: [],
      nodejs: {
        format: "cjs",
        install: [
          "@nestjs/mapped-types",
          "@nestjs/microservices",
          "@nestjs/websockets",
          "class-transformer"
        ]
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
