# ⚜️ MetalFactura

> **Sistema de facturación profesional para la compraventa de metales preciosos.**
> Construido con Next.js 14, PostgreSQL y una obsesión por los detalles.

---

```
  ███╗   ███╗███████╗████████╗ █████╗ ██╗      ███████╗ █████╗  ██████╗████████╗██╗   ██╗██████╗  █████╗
  ████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██║      ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗██╔══██╗
  ██╔████╔██║█████╗     ██║   ███████║██║      █████╗  ███████║██║        ██║   ██║   ██║██████╔╝███████║
  ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║      ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗██╔══██║
  ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║███████╗ ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║██║  ██║
  ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

---

## ¿Qué es esto?

MetalFactura es un sistema de gestión de facturación diseñado específicamente para **joyerías y comercios de metales preciosos** (oro y plata). Cubre todo el ciclo de vida de una factura: desde la creación del cliente hasta el envío del PDF por email, pasando por rectificativas, anulaciones y exportación a Excel.

Nada de soluciones genéricas. Esto está hecho para el sector.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript estricto |
| Estilos | TailwindCSS |
| Base de datos | PostgreSQL (Neon) |
| ORM | Prisma |
| Autenticación | NextAuth.js |
| PDF | jsPDF + jspdf-autotable |
| Email | Resend |
| Excel | SheetJS (xlsx) |
| Deploy | Vercel |

---

## Funcionalidades

### 👥 Clientes
- Alta, edición y eliminación de clientes
- Hasta **3 contactos** por cliente (nombre, cargo, teléfono, email)
- Notas internas privadas
- Historial completo de facturas por cliente
- Exportación a Excel

### 🧾 Facturas
- Numeración automática `FAC-YYYY-0001`
- Estados: **Pendiente · Pagada · Parcial · Anulada**
- Formas de pago: transferencia bancaria y tarjeta
- Múltiples líneas con cálculo automático
- Soporte para **oro (IGIC 0%) y plata (IGIC 15%)** en la misma factura
- Campos por línea: tipo, metal, producto, peso, pureza, cantidad, precio, descuento, nº serie

### 🔄 Facturas Rectificativas
- Numeración automática `R-YYYY-0001`
- Vinculación a la factura original
- Copia automática de líneas al crear

### 📄 PDF
- Generación instantánea con cabecera de empresa
- Tabla de productos con todos los campos
- Desglose de totales con IGIC por tipo
- Pie con forma de pago, IBAN y condiciones legales

### 📧 Email
- Envío directo al email del cliente
- PDF adjunto automáticamente
- Plantilla HTML corporativa
- Registro de fecha de envío

### 📊 Dashboard
- Total de clientes
- Facturas emitidas
- Total facturado
- Importe pendiente de cobro
- Últimas facturas en tiempo real

---

## Instalación local

### Requisitos previos
- Node.js 18+
- Cuenta en [Neon](https://neon.tech) (PostgreSQL gratuito)
- Cuenta en [Resend](https://resend.com) (email, opcional en desarrollo)

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/metal-factura.git
cd metal-factura
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-string-largo-y-aleatorio-minimo-32-chars"

# Acceso admin
ADMIN_EMAIL="tu@email.com"
ADMIN_PASSWORD="tu-password"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="facturas@tuempresa.com"

# Datos de empresa (aparecen en PDFs)
COMPANY_NAME="Tu Empresa S.L."
COMPANY_TAX_ID="B12345678"
COMPANY_ADDRESS="Calle Ejemplo 1, 35001 Las Palmas"
COMPANY_PHONE="+34 928 000 000"
COMPANY_EMAIL="info@tuempresa.com"
COMPANY_IBAN="ES00 0000 0000 00 0000000000"
```

### 3. Crear las tablas

```bash
npx prisma db push
```

### 4. Arrancar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → entra con tus credenciales de admin.

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Selecciona tu repositorio
3. En **Settings → Environment Variables** añade todas las variables del `.env`
4. Cambia `NEXTAUTH_URL` a `https://tu-proyecto.vercel.app`
5. Deploy

---

## Estructura del proyecto

```
metal-factura/
│
├── app/                          # Páginas y API routes (Next.js App Router)
│   ├── dashboard/                # Panel principal con estadísticas
│   ├── clientes/                 # CRUD de clientes
│   ├── facturas/                 # Gestión de facturas
│   └── api/                     # Endpoints REST
│       ├── customers/
│       ├── invoices/
│       │   └── [id]/{pdf,email,void}
│       └── export/{invoices,customers}
│
├── components/
│   ├── customers/                # CustomerForm, CustomerTable
│   ├── invoices/                 # InvoiceForm, InvoiceLines, InvoiceActions, InvoiceList
│   └── ui/                      # Sidebar, PageHeader, StatusBadge, StatsCards
│
├── lib/
│   ├── prisma.ts                 # Cliente Prisma singleton
│   ├── auth.ts                   # Configuración NextAuth
│   ├── invoice-calculations.ts   # Cálculos de totales e IGIC
│   ├── invoice-number.ts         # Generador de numeración FAC/R
│   ├── pdf-generator.ts          # Generación de PDF con jsPDF
│   ├── excel-export.ts           # Exportación XLSX
│   └── email-service.ts          # Envío de email con Resend
│
├── prisma/
│   └── schema.prisma             # Modelos: Customer, Contact, Invoice, InvoiceLine
│
└── types/
    ├── customer.ts
    └── invoice.ts
```

---

## Modelo de datos

```
Customer ──────┐
  id           │  1
  name         │  ──── Contact (hasta 3)
  taxId        │         name, role, phone, email
  address      │
  ...          │
               │
               └──── Invoice ──────── InvoiceLine
                       number           itemType (INGOT/COIN)
                       type             metal (GOLD/SILVER)
                       status           weightGrams
                       paymentMethod    purity
                       issueDate        quantity
                       total            unitPrice
                       ...              igicRate (0% / 15%)
                                        lineTotal
```

---

## Numeración de facturas

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Factura estándar | `FAC-YYYY-NNNN` | `FAC-2024-0001` |
| Factura rectificativa | `R-YYYY-NNNN` | `R-2024-0001` |

La numeración es **automática, secuencial y por año**. Nunca se repite.

---

## IGIC por metal

| Metal | Tipo IGIC | % |
|-------|-----------|---|
| Oro | Exento | 0% |
| Plata | General | 15% |

Una misma factura puede contener líneas de oro y plata con sus respectivos tipos de IGIC. El desglose aparece tanto en pantalla como en el PDF generado.

---

## Licencia

Uso privado. Todos los derechos reservados.

---

<div align="center">
  <sub>Hecho con precisión de orfebre. ⚜️</sub>
</div>