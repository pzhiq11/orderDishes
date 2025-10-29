import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 更新订单项
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const body = await request.json()
    const { quantity, note } = body

    const orderItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        quantity,
        note,
      },
      include: {
        dish: true,
      },
    })

    // 更新订单总价
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: id },
    })

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await prisma.order.update({
      where: { id },
      data: { totalPrice },
    })

    return NextResponse.json(orderItem)
  } catch (error) {
    console.error('更新订单项失败:', error)
    return NextResponse.json({ error: '更新订单项失败' }, { status: 500 })
  }
}

// 删除订单项
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    await prisma.orderItem.delete({
      where: { id: itemId },
    })

    // 更新订单总价
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: id },
    })

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await prisma.order.update({
      where: { id },
      data: { totalPrice },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除订单项失败:', error)
    return NextResponse.json({ error: '删除订单项失败' }, { status: 500 })
  }
}

