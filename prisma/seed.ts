import * as dotenv from "dotenv";
import path from "path";

// 1. Cargamos variables
dotenv.config({ path: path.join(__dirname, "../.env") });

import * as XLSX from "xlsx";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

// Validación visual
console.log("🔧 URL detectada:", process.env.DATABASE_URL ? "✅ SÍ" : "❌ NO");

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el .env");
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Iniciando seed...");

  const filePath = path.join(__dirname, "products.xlsx");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Error: No se encontró products.xlsx");
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) throw new Error("❌ Excel sin hojas");

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("❌ Hoja vacía o ilegible");

  const rawData: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`📂 Procesando ${rawData.length} filas...`);

  // Limpieza
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();

  for (const row of rawData) {
    if (!row.TIPO_PRENDA) continue;

    const rawPrice = row.PRECIO_50_U || 0;
    const cleanPrice =
      typeof rawPrice === "string"
        ? parseFloat(rawPrice.replace("$", "").replace(",", "").trim())
        : Number(rawPrice);

    await prisma.product.create({
      data: {
        name: `${row.TIPO_PRENDA}`,
        description: row.DESCRIPCIÓN || `Color ${row.COLOR}`,
        price: cleanPrice,
        stock: Number(row.CANTIDAD_DISPONIBLE || 0),
        size: String(row.TALLA || ""),
        color: String(row.COLOR || ""),
        category: String(row.CATEGORÍA || ""),
      },
    });
  }

  console.log("✅ Carga de productos finalizada.");
}

main()
  .catch((e) => {
    console.error("❌ ERROR EN SEED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
