import { config } from "./shared/config.js";
import { connectMongo } from "./shared/db.js";
import { createApp } from "./app.js";

async function main() {
  await connectMongo();
  const app = createApp();

  app.listen(config.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on :${config.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[api] fatal", err);
  process.exit(1);
});

