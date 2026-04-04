import express from "express";
import { app } from "../api/lib/app.js";

void express.json;

const port = Number(process.env.PORT ?? 4000);

if (!process.env.VERCEL) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`AI backend running at http://0.0.0.0:${port}`);
  });
}

export default app;
