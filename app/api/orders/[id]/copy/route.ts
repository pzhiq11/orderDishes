import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 复制订单到另一个订单
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { targetOrderId } = body

    // 获取源订单的所有菜品
    const sourceOrderItems = await prisma.orderItem.findMany({
      where: { orderId: id },
      include: {
        dish: true,
      },
    })

    if (sourceOrderItems.length === 0) {
      return NextResponse.json({ error: '源订单没有菜品' }, { status: 400 })
    }

    // 复制菜品到目标订单
    for (const item of sourceOrderItems) {
      // 检查目标订单是否已有该菜品
      const existingItem = await prisma.orderItem.findFirst({
        where: {
          orderId: targetOrderId,
          dishId: item.dishId,
        },
      })

      if (existingItem) {
        // 如果已存在，增加数量
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + item.quantity,
          },
        })
      } else {
        // 创建新的订单项
        await prisma.orderItem.create({
          data: {
            orderId: targetOrderId,
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            isRandom: false,
            note: item.note,
          },
        })
      }
    }

    // 更新目标订单总价
    const targetOrderItems = await prisma.orderItem.findMany({
      where: { orderId: targetOrderId },
    })

    const totalPrice = targetOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    await prisma.order.update({
      where: { id: targetOrderId },
      data: { totalPrice },
    })

    return NextResponse.json({ success: true, copiedCount: sourceOrderItems.length })
  } catch (error) {
    console.error('复制订单失败:', error)
    return NextResponse.json({ error: '复制订单失败' }, { status: 500 })
  }
}

