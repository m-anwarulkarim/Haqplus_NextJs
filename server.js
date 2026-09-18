const { createServer } = require("http");
const { parse } = require("url");

process.env.NODE_ENV = "production";
const port = process.env.PORT || 3000;

let app;
let handle;

try {
  const next = require("next");
  app = next({ dev: false, dir: __dirname });
  handle = app.getRequestHandler();
} catch (err) {
  // Standalone mode fallback where next CLI dev entry point is pruned by Next.js
  const NextServer = require("next/dist/server/next-server").default;
  app = new NextServer({
    hostname: "0.0.0.0",
    port,
    dir: __dirname,
    dev: false,
    customServer: false,
    conf: {
      distDir: ".next",
    },
  });
  handle = app.getRequestHandler();
}

const startServer = () => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> App ready on port ${port}`);
  });
};

if (app && app.prepare && typeof app.prepare === "function") {
  app.prepare().then(startServer).catch((err) => {
    console.error("Failed to prepare app:", err);
    process.exit(1);
  });
} else {
  startServer();
}
