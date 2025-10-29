import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 添加菜品到订单
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { dishId, quantity, isRandom, note } = body

    // 获取菜品信息
    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
    })

    if (!dish) {
      return NextResponse.json({ error: '菜品不存在' }, { status: 404 })
    }

    // 检查是否已存在相同菜品
    const existingItem = await prisma.orderItem.findFirst({
      where: {
        orderId: id,
        dishId: dishId,
      },
    })

    let orderItem

    if (existingItem) {
      // 如果已存在，增加数量
      orderItem = await prisma.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1),
        },
        include: {
          dish: {
            include: {
              category: true,
            },
          },
        },
      })
    } else {
      // 创建新的订单项
      orderItem = await prisma.orderItem.create({
        data: {
          orderId: id,
          dishId,
          quantity: quantity || 1,
          price: dish.price,
          isRandom: isRandom || false,
          note,
        },
        include: {
          dish: {
            include: {
              category: true,
            },
          },
        },
      })
    }

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
    console.error('添加菜品失败:', error)
    return NextResponse.json({ error: '添加菜品失败' }, { status: 500 })
  }
}

