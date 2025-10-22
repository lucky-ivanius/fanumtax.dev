import type { HTTPResponseError } from "hono/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { trimTrailingSlash } from "hono/trailing-slash";

import type { Env } from "./env";
import { authHandlers } from "./handlers/auth";
import { connectHandlers } from "./handlers/connect";
import { discoverHandlers } from "./handlers/discover";
import { reposHandlers } from "./handlers/repos";
import { settingsHandlers } from "./handlers/settings";
import { badRequest, notFound, unauthorized, unexpectedError } from "./utils/response";

const app = new Hono<Env>();

app.use(cors()).use(trimTrailingSlash()).use(requestId());

app
  .basePath("/v1")
  .route("/auth", authHandlers)
  .route("/connect", connectHandlers)
  .route("/discover", discoverHandlers)
  .route("/repos", reposHandlers)
  .route("/settings", settingsHandlers);

app
  .all("*", async (c) => notFound(c))
  .onError(async (err, c) => {
    const error = err as HTTPResponseError;
    if (!error.getResponse) {
      console.error(err);

      return unexpectedError(c);
    }

    const response = error.getResponse();

    switch (response.status) {
      case 400:
        return badRequest(c, {
          message: error.message || "Bad request",
        });
      case 401:
        return unauthorized(c, {
          message: error.message || "Unauthorized",
        });
      case 404:
        return notFound(c);
      default:
        console.error(err);

        return unexpectedError(c);
    }
  });

export default app;
