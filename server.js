import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady } from "@remix-run/node";
import express from "express";
import * as build from "./build/index.js";
import { ExpressAuth } from "@auth/express";
import TikTok from "@auth/express/providers/tiktok";

const app = express();
const PORT = process.env.PORT || 5656;
const CLIENT_KEY = process.env.CLIENT_KEY;
const SERVER_ENDPOINT_REDIRECT =
  "https://cc00-126-196-154-238.ngrok-free.app/callback";
const CODE_VERIFIER = process.env.CODE_VERIFIER;
const CODE_CHALLENGE = process.env.CODE_CHALLENGE;

app.use(express.static("public"));

// auth.js
app.get("/auth/*", ExpressAuth({ providers: [TikTok] }));

// scratch oauth callback
app.get("/oauth", (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });

  const url = "https://www.tiktok.com/v2/auth/authorize";
  const q = new URLSearchParams();
  q.append("client_key", CLIENT_KEY);
  // https://developers.tiktok.com/doc/tiktok-api-scopes/
  q.append("scope", "user.info.basic,video.list");
  q.append("response_type", "code");
  q.append("redirect_uri", SERVER_ENDPOINT_REDIRECT);
  q.append("state", csrfState);
  // q.append("code_challenge", CODE_CHALLENGE);
  // q.append("code_challenge_method", "S256");

  const uri = `${url}?${q.toString()}`;

  res.redirect(uri);
});

app.all("*", createRequestHandler({ build }));

app.listen(PORT, () => {
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
  console.log(`Server started on http://localhost:${PORT}`);
});
