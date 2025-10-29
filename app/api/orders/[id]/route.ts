import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单个订单详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            dish: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    return NextResponse.json({ error: '获取订单详情失败' }, { status: 500 })
  }
}

// 更新订单
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, note, totalPrice } = body

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        note,
        totalPrice,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('更新订单失败:', error)
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 })
  }
}

// 删除订单
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除订单失败:', error)
    return NextResponse.json({ error: '删除订单失败' }, { status: 500 })
  }
}

