// Executa os testes no jsc (JavaScriptCore do macOS): ./testar.sh
import "./todos.js";
import { run } from "./runner.js";

const r = run();
for (const f of r.falhas) print(`FALHOU: ${f.nome} — ${f.erro}`);
print(`${r.passou} passaram, ${r.falhou} falharam`);
if (r.falhou > 0) throw new Error("testes falharam");
