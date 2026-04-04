import serverless from "serverless-http";
import { app } from "../src/app.js";

// Wrap express app for Vercel
export default serverless(app);
