import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新菜品
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, categoryId, price, description, isActive } = body

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        description,
        isActive,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(dish)
  } catch (error) {
    console.error('更新菜品失败:', error)
    return NextResponse.json({ error: '更新菜品失败' }, { status: 500 })
  }
}

// 删除菜品
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.dish.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除菜品失败:', error)
    return NextResponse.json({ error: '删除菜品失败' }, { status: 500 })
  }
}

