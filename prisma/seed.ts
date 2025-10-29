import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始导入默认菜单数据...')

  // 创建分类和菜品数据
  const categories = [
    {
      name: '千锅系列',
      dishes: [
        { name: '千锅肥肠', price: 88 },
        { name: '千锅干叶豆腐', price: 35 },
      ]
    },
    {
      name: '焖菜系列',
      dishes: [
        { name: '笋子烧牛肉', price: 42 },
        { name: '青笋烧肥肠', price: 42 },
        { name: '腐芋烧鸭', price: 38 },
      ]
    },
    {
      name: '家常小炒',
      dishes: [
        { name: '苦瓜煎蛋', price: 20 },
        { name: '韭黄炒蛋', price: 18 },
        { name: '西红柿炒鸡蛋', price: 16 },
        { name: '茄子豆角', price: 16 },
        { name: '酸菜加旺', price: 16 },
        { name: '虎皮辣椒', price: 15 },
        { name: '鱼香茄子', price: 15 },
        { name: '白灼风尾', price: 14 },
        { name: '青椒土豆丝', price: 12 },
        { name: '梅菜和肉', price: 28 },
      ]
    },
    {
      name: '辣口味菜（凉菜）',
      dishes: [
        { name: '麻辣牛肉', price: 28 },
        { name: '泡椒耳片', price: 25 },
        { name: '蒜泥白肉', price: 25 },
        { name: '洋猪头肉', price: 25 },
        { name: '洋猪心', price: 25 },
        { name: '烧椒皮蛋', price: 15 },
        { name: '油酥花生', price: 13 },
        { name: '拌凉粉', price: 12 },
      ]
    },
    {
      name: '精品特色',
      dishes: [
        { name: '水牛肉', price: 48 },
        { name: '毛血旺', price: 45 },
        { name: '糖醋里脊', price: 38 },
        { name: '水煮肉片', price: 35 },
        { name: '辣子鸡丁', price: 30 },
      ]
    },
    {
      name: '新鲜食材',
      dishes: [
        { name: '活水鱼', price: 58 },
        { name: '乐山辣子鸡', price: 48 },
        { name: '脆花烧豆腐', price: 29 },
        { name: '泡椒鸡杂', price: 28 },
      ]
    },
    {
      name: '大盘系列',
      dishes: [
        { name: '大盘花菜', price: 25 },
        { name: '大盘土豆片', price: 25 },
      ]
    },
    {
      name: '肉片/肉丝小炒',
      dishes: [
        { name: '青笋木耳肉片', price: 25 },
        { name: '韭黄肉丝', price: 25 },
        { name: '苦瓜炒肉', price: 25 },
        { name: '蒜苔肉丝', price: 25 },
        { name: '京酱肉丝', price: 30 },
        { name: '甜椒肉丝', price: 25 },
        { name: '官爆鸡丁', price: 25 },
        { name: '仔姜肉丝', price: 25 },
        { name: '盐煎肉', price: 25 },
        { name: '豆干肉丝', price: 22 },
      ]
    },
    {
      name: '铁板系列',
      dishes: [
        { name: '铁板牛肉', price: 48 },
        { name: '铁板肥肠', price: 48 },
        { name: '铁板腰片', price: 48 },
        { name: '铁板生肠', price: 42 },
        { name: '铁板水晶豆腐', price: 28 },
        { name: '铁板鱿鱼', price: 42 },
      ]
    },
    {
      name: '火爆系列',
      dishes: [
        { name: '火爆肥肠', price: 42 },
        { name: '火爆腰花', price: 38 },
      ]
    },
    {
      name: '其他小炒',
      dishes: [
        { name: '小炒黄牛肉', price: 42 },
        { name: '尖椒猪头肉', price: 25 },
        { name: '农家小炒肉', price: 25 },
        { name: '肝腰和炒', price: 30 },
        { name: '回锅肉', price: 25 },
        { name: '青椒肉丝', price: 25 },
        { name: '香干腊肉', price: 38 },
        { name: '秘制红烧肉', price: 42 },
      ]
    },
  ]

  let sortOrder = 0
  for (const categoryData of categories) {
    sortOrder++
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        sortOrder: sortOrder,
      },
    })

    console.log(`创建分类: ${category.name}`)

    let dishSortOrder = 0
    for (const dishData of categoryData.dishes) {
      dishSortOrder++
      await prisma.dish.create({
        data: {
          name: dishData.name,
          price: dishData.price,
          categoryId: category.id,
          sortOrder: dishSortOrder,
          isActive: true,
        },
      })
    }
  }

  console.log('默认菜单数据导入完成！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

