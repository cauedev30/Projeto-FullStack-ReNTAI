import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const source = resolve(".env.example");
const target = resolve("apps/api/.env");

if (!existsSync(source)) {
  throw new Error("Arquivo .env.example nao encontrado na raiz do projeto.");
}

if (existsSync(target)) {
  console.log("apps/api/.env ja existe; mantendo configuracao local.");
} else {
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log("apps/api/.env criado a partir de .env.example.");
}
