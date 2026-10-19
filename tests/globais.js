// No jsc, carrega as bibliotecas que no navegador vêm por <script> (ex.: SheetJS).
if (typeof globalThis.XLSX === "undefined" && typeof globalThis.load === "function") {
  globalThis.load("vendor/xlsx.full.min.js");
}
