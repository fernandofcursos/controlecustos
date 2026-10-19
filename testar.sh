#!/bin/sh
# Roda os testes de lógica pela linha de comando usando o JavaScriptCore do macOS.
# No navegador, abra testes.html (servido por: python3 -m http.server 8000).
cd "$(dirname "$0")" && exec /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m tests/cli.js
