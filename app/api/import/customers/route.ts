import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

function normalizeKey(key: string): string {
  return key.toLowerCase().trim()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractField(row: Record<string, any>, ...aliases: string[]): string {
  for (const alias of aliases) {
    for (const key of Object.keys(row)) {
      if (normalizeKey(key) === normalizeKey(alias)) {
        return String(row[key] ?? '').trim();
      }
    }
  }
  return '';
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based + header row

      const name = extractField(row, 'nombre', 'name', 'razonsocial');
      const taxId = extractField(row, 'cif', 'nif', 'taxId', 'cif/nif');
      const address = extractField(row, 'direccion', 'address', 'dirección');
      const postalCode = extractField(row, 'codigopostal', 'postalCode', 'cp', 'codigopostal');
      const city = extractField(row, 'ciudad', 'city', 'localidad', 'poblacion');
      const province = extractField(row, 'provincia', 'province');
      const country = extractField(row, 'pais', 'country', 'país') || 'España';
      const phone = extractField(row, 'telefono', 'phone', 'tel', 'teléfono');
      const email = extractField(row, 'email', 'correo', 'mail');
      const notes = extractField(row, 'notas', 'notes', 'observaciones');

      if (!name || !taxId) {
        errors.push(`Fila ${rowNum}: nombre y CIF/NIF son obligatorios`);
        continue;
      }
      if (!address || !postalCode || !city || !province) {
        errors.push(`Fila ${rowNum} (${name}): dirección, CP, ciudad y provincia son obligatorios`);
        continue;
      }

      try {
        const existing = await prisma.customer.findUnique({ where: { taxId } });
        if (existing) {
          await prisma.customer.update({
            where: { taxId },
            data: { name, address, postalCode, city, province, country, phone: phone || null, email: email || null, notes: notes || null },
          });
          updated++;
        } else {
          await prisma.customer.create({
            data: { name, taxId, address, postalCode, city, province, country, phone: phone || null, email: email || null, notes: notes || null },
          });
          created++;
        }
      } catch (e: any) {
        errors.push(`Fila ${rowNum} (${name}): ${e.message ?? 'Error desconocido'}`);
      }
    }

    return NextResponse.json({ created, updated, errors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 });
  }
}
