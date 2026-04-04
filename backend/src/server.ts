import { app } from "../api/lib/app.js";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, "0.0.0.0", () => {
  console.log(`AI backend running at http://0.0.0.0:${port}`);
});
