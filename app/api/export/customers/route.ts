import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exportCustomersToExcel } from '@/lib/excel-export';

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customers = await prisma.customer.findMany({
    include: { contacts: true },
    orderBy: { name: 'asc' },
  });

  const buffer = exportCustomersToExcel(customers as any);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="clientes.xlsx"',
    },
  });
}
