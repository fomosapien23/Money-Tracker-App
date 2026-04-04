// Vercel's Express analysis requires express to be imported from this entry file.
import express from "express";
import { app } from "./lib/app.js";

void express.json;

export default app;
