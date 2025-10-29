import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有分类
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('获取分类失败:', error)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
}

// 创建新分类
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('创建分类失败:', error)
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
  }
}

