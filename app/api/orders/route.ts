import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有订单
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const where: any = {}
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      where.orderDate = {
        gte: startDate,
        lt: endDate,
      }
    }

    const orders = await prisma.order.findMany({
      where,
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
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('获取订单失败:', error)
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 })
  }
}

// 创建新订单
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderDate, note } = body

    const order = await prisma.order.create({
      data: {
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        note,
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('创建订单失败:', error)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }
}

