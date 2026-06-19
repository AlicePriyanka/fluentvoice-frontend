const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 5173;
const BASE_PATH = "/fluentvoice";
const OUT_DIR = path.resolve(__dirname, "../../out");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split("?")[0];
  
  if (!reqUrl.startsWith(BASE_PATH)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  let relativePath = reqUrl.slice(BASE_PATH.length);
  if (relativePath === "/" || relativePath === "") {
    relativePath = "/index.html";
  }

  let filePath = path.join(OUT_DIR, relativePath);

  // If path is a directory, look for index.html inside it (Next.js export trailingSlash: true format)
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  // Next.js static files fallback without trailing slash/extension
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = filePath + ".html";
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Try serving Next.js custom 404.html if exists, otherwise fallback
    const fallbackPath = path.join(OUT_DIR, "404.html");
    if (fs.existsSync(fallbackPath)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      fs.createReadStream(fallbackPath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[FluentVoice Static Local Server] Running at http://127.0.0.1:${PORT}${BASE_PATH}/`);
});
