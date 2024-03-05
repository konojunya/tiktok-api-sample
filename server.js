import { logDevReady } from "@remix-run/node";
import { broadcastDevReady } from "@remix-run/node";
import * as build from "./build/index.js";
import { Hono } from "hono";
import { remix } from "remix-hono/handler";
import { serve } from "@hono/node-server";

if (process.env.NODE_ENV === "development") logDevReady(build);

const app = new Hono();
const port = process.env.PORT || 5656;

app.use(
  "*",
  remix({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext(c) {
      return c.env;
    },
  })
);

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    if (process.env.NODE_ENV === "development") {
      broadcastDevReady(build);
    }
    console.log(`Server started on http://localhost:${port}`);
  }
);
