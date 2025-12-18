# 🤖 Laburen AI Agent - Vendedor Mayorista de WhatsApp

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20bard&logoColor=white)

Este proyecto es un **Agente de IA Transaccional** diseñado para automatizar ventas mayoristas a través de WhatsApp. A diferencia de los chatbots tradicionales, este agente utiliza **Google Gemini** con capacidades de _Function Calling_ para interactuar en tiempo real con una base de datos PostgreSQL, permitiendo consultar stock real, calcular precios escalonados y generar pedidos sin alucinaciones.

---

## 🚀 Características Principales

- **🧠 IA sin Alucinaciones:** El bot no inventa precios ni stock. Utiliza herramientas deterministas conectadas a la base de datos.
- **🛒 Lógica Mayorista:** Valida reglas de negocio complejas (compra mínima de 50 unidades, descuentos por volumen).
- **⚡ Stock en Tiempo Real:** Las consultas de inventario son instantáneas y reflejan la disponibilidad real.
- **🛡️ Transacciones ACID:** La creación de pedidos utiliza transacciones de base de datos para asegurar la integridad del stock.
- **🗣️ Procesamiento de Lenguaje Natural:** Entiende intenciones complejas como "Quiero 50 pantalones negros y 100 camisas blancas".

---

## 📚 Documentación Técnica

Para ver la arquitectura detallada, diagramas de secuencia y especificación de endpoints, consulta la documentación técnica:

👉 **[VER DOCUMENTACIÓN TÉCNICA (API_DOCS.md)](./API_DOCS.md)**

---

## 🛠️ Stack Tecnológico

- **Lenguaje:** TypeScript / Node.js
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL (Neon Tech)
- **ORM:** Prisma
- **IA:** Google Gemini 2.5 Flash
- **Mensajería:** Twilio API for WhatsApp
- **Deploy:** Render

---

## ⚙️ Configuración e Instalación

### 1. Prerrequisitos

- Node.js v18 o superior.
- Cuenta en [Twilio](https://www.twilio.com/) (para WhatsApp Sandbox).
- Cuenta en [Google AI Studio](https://aistudio.google.com/) (para API Key de Gemini).
- Base de datos PostgreSQL (local o nube).

### 2. Clonar el repositorio

```bash
git clone [https://github.com/tu-usuario/laburen-ai-challenge.git](https://github.com/tu-usuario/laburen-ai-challenge.git)
cd laburen-ai-challenge
```

### 3. Instalar dependencias

- npm install

### 4. Variables de entorno

- Crea un archivo .env en la raíz del proyecto y completa los siguientes datos:
  PORT=3000
  DATABASE_URL="postgresql://usuario:password@host:port/database"

# Google Gemini

GEMINI_API_KEY="tu_api_key_aqui"

# Twilio Configuration

TWILIO_ACCOUNT_SID="tu_sid"
TWILIO_AUTH_TOKEN="tu_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886" # Número del Sandbox

### 5. Configurar la base de datos

npx prisma generate
npx prisma db push
(Opcional) Si tienes un script de seed:
npx prisma db seed

### 6. Ejecutar en desarrollo

npm run dev
El servidor iniciará en http://localhost:3000.

### 🧪 Cómo probar (Testing)\*\*

### 1. Conectar Twilio:

- Si estás en local, usa Ngrok para exponer tu puerto 3000: ngrok http 3000.

- Copia la URL generada (ej: https://xyz.ngrok-free.app/webhook).

- Ve a la consola de Twilio > Messaging > WhatsApp Sandbox Settings.

- Pega la URL en "When a message comes in".

### 2. Enviar mensaje:

- Abre Whatsapp y escribe el numero del Sandbox

- Prueba: "Hola, ¿Que productos tenés disponible?"

- Prueba: "Quiero 60 pantalones formales"

### 🌍 Despliegue (Deploy)

- Este proyecto está configurado para desplegarse fácilmente en Render:

### 1. Crear nuevo Web Service en Render.

### 2. Conectar repositorio de GitHub.

### 3. Build Command: npm install && npm run build

### 4. Start Command: npm start

### 5. Agregar las variables de entorno en el panel de Render.
