import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT = update data by id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json()
    const { nama, jumlah, satuan, kategori } = body
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const updated = await prisma.sisa.update({
      where: { id },
      data: { nama, jumlah: parseFloat(jumlah), satuan, kategori },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengupdate data' }, { status: 500 })
  }
}

// DELETE data by id
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    await prisma.sisa.delete({ where: { id } })
    return NextResponse.json({ message: 'Data berhasil dihapus' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 })
  }
}
