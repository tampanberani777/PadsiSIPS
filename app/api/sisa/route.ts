import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all data
export async function GET() {
  try {
    const data = await prisma.sisa.findMany({
      orderBy: { id: 'desc' },
    })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

// POST (tambah data baru)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nama, jumlah, satuan, kategori } = body

    const newData = await prisma.sisa.create({
      data: { nama, jumlah: parseFloat(jumlah), satuan, kategori },
    })

    return NextResponse.json(newData)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambah data' }, { status: 500 })
  }
}
