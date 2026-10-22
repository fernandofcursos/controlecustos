#!/bin/sh
# Roda os testes de lógica pela linha de comando usando o JavaScriptCore do macOS.
# No navegador, abra testes.html (servido por: python3 -m http.server 8000).
cd "$(dirname "$0")" || exit 1

# Confere se a lista de arquivos do service worker (sw.js) está completa.
faltando=""
for f in index.html instalar.html manifest.webmanifest css/*.css js/*.js js/views/*.js vendor/* icons/*.png icons/*.jpg; do
  [ "$f" = "icons/qrcode.png" ] && continue
  grep -q "\"$f\"" sw.js || faltando="$faltando $f"
done
if [ -n "$faltando" ]; then
  echo "FALHOU: arquivos fora da lista ARQUIVOS do sw.js:$faltando"
  exit 1
fi

exec /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m tests/cli.js
