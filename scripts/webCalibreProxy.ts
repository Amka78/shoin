/**
 * Web リリース（Docker）用の Calibre プロキシ。
 *
 * nginx が TLS と静的配信を担当し、`/__calibre/...` だけをこのプロセスへ転送する。
 * 外部公開を想定するため、CALIBRE_PROXY_ALLOWED_HOSTS で上流を制限できる。
 * 許可リストが空の場合は全ホストを許可する（LAN 専用なら空でもよい）。
 *
 * 実行環境: 自宅サーバー（Core 2 Duo E7500）では Bun のコンパイル産物（JSC）が
 * Illegal instruction で起動しないため、`bun build --target=node` のバンドルを
 * Node で実行する。ここに Bun 固有 API（Bun.serve 等）を入れてはいけない。
 */
import { createServer } from "node:http"
import { Readable } from "node:stream"
import type { ReadableStream } from "node:stream/web"
import {
  buildCorsHeaders,
  isAllowedCalibreHost,
  parseAllowedCalibreHosts,
  proxyCalibreRequest,
  resolveCalibreTarget,
} from "../src-electrobun/calibreProxy"

const hostname = "127.0.0.1"
const port = Number(process.env.CALIBRE_PROXY_PORT ?? 8082)
const allowedHosts = parseAllowedCalibreHosts(process.env.CALIBRE_PROXY_ALLOWED_HOSTS)

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`[calibre-proxy] Invalid CALIBRE_PROXY_PORT: ${process.env.CALIBRE_PROXY_PORT}`)
  process.exit(1)
}

if (allowedHosts.length === 0) {
  console.warn(
    "[calibre-proxy] CALIBRE_PROXY_ALLOWED_HOSTS is empty: any http(s) host can be proxied. " +
      "Set it when this server is publicly reachable.",
  )
}

const server = createServer(async (req, res) => {
  let requestUrl: URL
  try {
    requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? hostname}`)
  } catch {
    res.writeHead(400)
    res.end("Bad Request")
    return
  }

  if (requestUrl.pathname === "/__calibre/health") {
    res.writeHead(200, { "content-type": "text/plain" })
    res.end("ok")
    return
  }

  // IncomingMessage → Web Request。body は undici がストリーム（AsyncIterable）として読める。
  const headers = new Headers()
  for (const [key, values] of Object.entries(req.headers)) {
    if (values === undefined) continue
    headers.set(key, Array.isArray(values) ? values.join(", ") : values)
  }
  const init: RequestInit = { method: req.method, headers }
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req as unknown as BodyInit
    ;(init as RequestInit & { duplex: string }).duplex = "half"
  }
  const request = new Request(requestUrl.href, init)

  const target = resolveCalibreTarget(requestUrl.href)
  if (!target) {
    res.writeHead(404, buildCorsHeaders(request))
    res.end("Not a Calibre proxy request")
    return
  }

  if (!isAllowedCalibreHost(target, allowedHosts)) {
    console.warn(`[calibre-proxy] blocked target: ${target.host}`)
    res.writeHead(403, buildCorsHeaders(request))
    res.end("Calibre proxy target is not allowed")
    return
  }

  // リダイレクトを追うと許可リストを迂回できるため、公開プロキシでは追跡しない。
  const upstream = await proxyCalibreRequest(request, target, { redirect: "error" })

  res.writeHead(
    upstream.status,
    upstream.statusText ? upstream.statusText : undefined,
    Object.fromEntries(upstream.headers),
  )
  if (upstream.body) {
    Readable.fromWeb(upstream.body as ReadableStream).pipe(res)
  } else {
    res.end()
  }
})

server.on("error", (err) => {
  console.error("[calibre-proxy] server error:", err)
  process.exit(1)
})

server.listen(port, hostname, () => {
  const addr = server.address()
  const actualPort = typeof addr === "object" && addr !== null ? addr.port : port
  console.log(`[calibre-proxy] listening on http://${hostname}:${actualPort}`)
  console.log(
    `[calibre-proxy] allowed hosts: ${allowedHosts.length ? allowedHosts.join(", ") : "(any)"}`,
  )
})
