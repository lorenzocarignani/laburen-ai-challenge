import * as dotenv from "dotenv";
import path from "path";
import * as XLSX from "xlsx";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: No se encontró DATABASE_URL.");
  process.exit(1);
}

const prisma = new PrismaClient();

// Helper: Limpiar precios
const cleanCurrency = (value: any): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  const cleanString = String(value)
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Quita puntos de mil
    .replace(/,/g, ".") // Cambia coma decimal por punto
    .trim();
  const number = parseFloat(cleanString);
  return isNaN(number) ? 0 : number;
};

// --- NUEVO HELPER MEJORADO: Lógica de Disponibilidad ---
const determineAvailability = (valColumna: any, stockReal: number): boolean => {
  // 1. REGLA SUPREMA: Si no hay stock para mayorista (menos de 50), NO está disponible.
  if (stockReal < 50) return false;

  // 2. Si la celda del Excel está vacía, asumimos TRUE (porque ya validamos que hay stock)
  if (!valColumna) return true;

  // 3. Limpieza de texto (SÍ -> si, Yes -> yes, TRUE -> true)
  const texto = String(valColumna)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Esto QUITA las tildes (sí -> si)

  // 4. Lista de palabras positivas
  const positivos = [
    "si",
    "s",
    "yes",
    "y",
    "true",
    "t",
    "verdadero",
    "1",
    "available",
    "disponible",
  ];

  return positivos.includes(texto);
};

async function main() {
  console.log("🌱 Iniciando Seed Corregido...");

  const filePath = path.join(__dirname, "products.xlsx");
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No se encontró: ${filePath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`📄 Procesando ${rawData.length} filas...`);

  // Borramos datos viejos
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();

  let count = 0;
  let disponiblesCount = 0;

  for (const row of rawData) {
    const nombre = row.TIPO_PRENDA || row.PRODUCTO || row.Nombre;
    if (!nombre) continue;

    const p50 = cleanCurrency(
      row.PRECIO_50_U || row["Precio 50"] || row.Mayorista1
    );
    const p100 = cleanCurrency(
      row.PRECIO_100_U || row["Precio 100"] || row.Mayorista2
    );
    const p200 = cleanCurrency(
      row.PRECIO_200_U || row["Precio 200"] || row.Mayorista3
    );

    const stock = Number(row.CANTIDAD_DISPONIBLE || row.Stock || 0);

    // USAMOS LA NUEVA FUNCIÓN
    // Busca la columna 'DISPONIBLE', 'Available', etc.
    const valorExcel =
      row.DISPONIBLE || row.Disponible || row.AVAILABLE || row.Active;
    const isAvailable = determineAvailability(valorExcel, stock);

    if (isAvailable) disponiblesCount++;

    await prisma.product.create({
      data: {
        name: String(nombre),
        description:
          row.DESCRIPCIÓN ||
          row.Descripcion ||
          `Color ${row.COLOR || "Varios"}`,

        // NO descomentar 'price' si lo borraste del schema
        // price: p50,

        price50: p50,
        price100: p100,
        price200: p200,

        stock: stock,
        size: String(row.TALLA || row.Talle || ""),
        color: String(row.COLOR || row.Color || ""),
        category: String(row.CATEGORÍA || row.Categoria || ""),

        available: isAvailable,
      },
    });
    count++;
  }
  console.log(
    `✅ Seed completado. Total: ${count} | Disponibles: ${disponiblesCount}`
  );

  if (disponiblesCount === 0) {
    console.warn(
      "⚠️ ALERTA: Se cargaron 0 productos disponibles. Revisa si el stock es < 50 o si la columna del Excel tiene valores raros."
    );
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
