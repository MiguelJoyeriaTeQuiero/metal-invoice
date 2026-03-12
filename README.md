# MetalFactura 🥇

Sistema de facturación para venta de metales preciosos (oro y plata).

## Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Prisma + PostgreSQL (Neon)
- NextAuth (credenciales)
- Resend (email)
- jsPDF (PDF)
- XLSX (Excel)

---

## 🚀 Instalación local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
DATABASE_URL="postgresql://..."     # Tu URL de Neon
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-secret-largo-aleatorio"
ADMIN_EMAIL="admin@tuempresa.com"
ADMIN_PASSWORD="tu-password"
RESEND_API_KEY="re_..."             # De resend.com (opcional para desarrollo)
EMAIL_FROM="facturas@tuempresa.com"
COMPANY_NAME="Tu Empresa S.L."
COMPANY_TAX_ID="B12345678"
COMPANY_ADDRESS="Calle Ejemplo 1, 35001 Las Palmas"
COMPANY_PHONE="+34 928 000 000"
COMPANY_EMAIL="info@tuempresa.com"
COMPANY_IBAN="ES00 0000 0000 00 0000000000"
```

### 3. Crear tablas en la base de datos

```bash
npx prisma db push
```

### 4. Arrancar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Añade todas las variables de entorno del paso 2
4. Cambia `NEXTAUTH_URL` a tu dominio de Vercel
5. Deploy automático

---

## 📁 Estructura

```
app/              → Páginas y API routes
components/       → Componentes React
  customers/      → Formularios y tablas de clientes
  invoices/       → Formularios y tablas de facturas
  ui/             → Componentes compartidos
lib/              → Utilidades (PDF, Excel, Email, cálculos)
prisma/           → Schema de base de datos
types/            → Tipos TypeScript
```

---

## ✅ Funcionalidades

- 🔐 Login admin
- 👥 CRUD Clientes + hasta 3 contactos
- 🧾 Crear facturas (FAC-YYYY-NNNN)
- 🔄 Crear rectificativas (R-YYYY-NNNN)
- 📄 Generar PDF
- 📧 Enviar por email
- ❌ Anular facturas
- 📊 Exportar a Excel (facturas y clientes)
- 🔍 Filtros y búsqueda
- 📈 Dashboard con estadísticas
