import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const { default: app } = await import("../app.js");

const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log(`CARPI backend listening on port ${port}`);
});
