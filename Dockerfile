# Stage 1: Build
# oven/bun:1 は浮動タグのため再ビルドごとに Bun が進み、生成バイナリの要求命令セットが
# 上がってサーバー（Core 2 Duo E7500 等の旧 CPU）で Illegal instruction になる事故があった。
# バージョンを固定して再現性を確保する（上げるときは意図的に行う）。
FROM oven/bun:1.4.4 AS builder

WORKDIR /app

ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV NODE_ENV=production

# Install dependencies (cached separately from source code)
COPY package.json bun.lock bunfig.toml ./
COPY bin/ ./bin/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy source and build
COPY . .
# `;` にすると export が失敗（timeout 含む）しても exit code が無視され、
# 後段の存在チェックだけを通過して「成功なのに中身が古い」イメージになる。&& で伝播させる。
# timeout は実測（expo export に約5.5分）に対して 300s では余裕が無いため引き上げる。
RUN timeout 900 bunx expo export --platform web --output-dir dist && \
    [ -f dist/index.html ]

# Web リリース用 Calibre プロキシ。自宅サーバー（Core 2 Duo E7500）では Bun の
# コンパイル産物（JSC）が Illegal instruction で起動しないため、Node で動く
# バンドルに変換する。生成は CI のモダン CPU 上で行い、実行はサーバー上の Node。
RUN bun build scripts/webCalibreProxy.ts --target=node --format=cjs \
    --outfile web-calibre-proxy.cjs

# Stage 2: Serve
FROM nginx:alpine

# 自己署名証明書の生成（openssl）・nginx.conf テンプレートの展開（envsubst）・
# Calibre プロキシの実行（nodejs。V8 は E7500 でも動作し、Bun/JSC は SIGILL になる）
RUN apk add --no-cache openssl gettext nodejs

# nginx.conf はテンプレート。エントリポイントが ${HTTPS_PORT} を展開して
# /etc/nginx/conf.d/default.conf を生成する（HTTPS 用のサーバーブロックを含む）
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/web-calibre-proxy.cjs /usr/local/bin/web-calibre-proxy.cjs

EXPOSE 80 443

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
