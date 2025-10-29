import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有菜品
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.name = {
        contains: search,
      }
    }

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
    })

    return NextResponse.json(dishes)
  } catch (error) {
    console.error('获取菜品失败:', error)
    return NextResponse.json({ error: '获取菜品失败' }, { status: 500 })
  }
}

// 创建新菜品
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, categoryId, price, description, isActive } = body

    const dish = await prisma.dish.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        description,
        isActive: isActive ?? true,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(dish)
  } catch (error) {
    console.error('创建菜品失败:', error)
    return NextResponse.json({ error: '创建菜品失败' }, { status: 500 })
  }
}

