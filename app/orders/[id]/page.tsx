'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface Dish {
  id: string
  name: string
  price: number
  categoryId: string
  isActive: boolean
  category: {
    name: string
  }
}

interface OrderItem {
  id: string
  dishId: string
  quantity: number
  price: number
  isRandom: boolean
  note?: string
  dish: {
    id: string
    name: string
    price: number
    category: {
      name: string
    }
  }
}

interface Order {
  id: string
  orderDate: string
  status: string
  totalPrice: number
  note?: string
  orderItems: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [showRandomModal, setShowRandomModal] = useState(false)
  const [randomDish, setRandomDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchOrder()
    fetchCategories()
    fetchDishes()
    fetchAllOrders()

    // 自动刷新：每5秒更新一次订单数据
    const intervalId = setInterval(() => {
      fetchOrder()
    }, 5000)

    // 清除定时器
    return () => clearInterval(intervalId)
  }, [orderId])

  useEffect(() => {
    fetchDishes()
  }, [selectedCategory, searchTerm])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchDishes = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/dishes?${params}`)
      const data = await res.json()
      setDishes(data.filter((d: Dish) => d.isActive))
    } catch (error) {
      console.error('获取菜品失败:', error)
    }
  }

  const fetchAllOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setAllOrders(data.filter((o: Order) => o.id !== orderId && o.orderItems.length > 0))
    } catch (error) {
      console.error('获取订单列表失败:', error)
    }
  }

  const handleAddDish = async (dishId: string, isRandom = false) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId, quantity: 1, isRandom }),
      })

      if (res.ok) {
        fetchOrder()
      }
    } catch (error) {
      console.error('添加菜品失败:', error)
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return

    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      if (res.ok) {
        fetchOrder()
      }
    } catch (error) {
      console.error('更新数量失败:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchOrder()
      }
    } catch (error) {
      console.error('删除菜品失败:', error)
    }
  }

  const handleCopyOrder = async (sourceOrderId: string) => {
    try {
      const res = await fetch(`/api/orders/${sourceOrderId}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetOrderId: orderId }),
      })

      if (res.ok) {
        fetchOrder()
        setShowCopyModal(false)
      }
    } catch (error) {
      console.error('复制订单失败:', error)
    }
  }

  const handleRandomDish = () => {
    const activeDishes = dishes.filter((d) => d.isActive)
    if (activeDishes.length === 0) return

    const randomIndex = Math.floor(Math.random() * activeDishes.length)
    setRandomDish(activeDishes[randomIndex])
    setShowRandomModal(true)
  }

  const handleAddRandomDish = () => {
    if (randomDish) {
      handleAddDish(randomDish.id, true)
      setShowRandomModal(false)
      setRandomDish(null)
    }
  }

  const handleCompleteOrder = async () => {
    if (!confirm('确定要完成这个订单吗？')) return

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      if (res.ok) {
        router.push('/orders')
      }
    } catch (error) {
      console.error('完成订单失败:', error)
    }
  }

  const handleCopyDishNames = () => {
    if (!order) return

    // 获取所有菜品名称，用、分割
    const dishNames = order.orderItems.map(item => item.dish.name).join('、')

    // 复制到剪贴板
    navigator.clipboard.writeText(dishNames).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }).catch(err => {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">订单不存在</p>
      </div>
    )
  }

  // 判断订单是否已完成
  const isOrderCompleted = order.status === 'COMPLETED'

  // 按分类分组已点菜品
  const groupedItems = order.orderItems.reduce((acc, item) => {
    const categoryName = item.dish.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {} as Record<string, OrderItem[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full sm:w-auto">
              <Link 
                href="/orders" 
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回订单列表
              </Link>
              <h1 className="text-xl md:text-2xl font-bold mt-2 md:mt-3 flex flex-wrap items-center gap-2 md:gap-3">
                <span>点菜 - {new Date(order.orderDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
                <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded whitespace-nowrap">
                  🔄 自动刷新中
                </span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isOrderCompleted ? (
                <div className="px-3 md:px-4 py-2 bg-green-100 text-green-700 rounded font-semibold text-sm md:text-base w-full sm:w-auto text-center">
                  ✓ 订单已完成
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowCopyModal(true)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">添加历史菜单</span>
                    <span className="sm:hidden">📋 添加</span>
                  </button>
                  <button
                    onClick={handleRandomDish}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm md:text-base"
                  >
                    🎲 <span className="hidden sm:inline">随机推荐</span><span className="sm:hidden">随机</span>
                  </button>
                  <button
                    onClick={handleCompleteOrder}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm md:text-base"
                  >
                    <span className="hidden sm:inline">完成订单</span>
                    <span className="sm:hidden">✓ 完成</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
          {/* 左侧：菜单浏览 */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow h-[400px] lg:h-[calc(100vh-140px)] flex flex-col">
              <div className="p-3 sm:p-4 border-b flex-shrink-0">
                <h2 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">菜单</h2>
                <input
                  type="text"
                  placeholder="搜索菜品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 分类标签 */}
              <div className="p-2 sm:p-4 border-b flex flex-wrap gap-1.5 sm:gap-2 flex-shrink-0 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                    selectedCategory === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* 菜品列表 */}
              <div className="p-2 sm:p-4 flex-1 overflow-y-auto">
                {isOrderCompleted ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">✓</div>
                    <p className="text-base sm:text-lg font-semibold mb-2">订单已完成</p>
                    <p className="text-xs sm:text-sm">无法添加更多菜品</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="flex justify-between items-center p-2 sm:p-3 border rounded hover:bg-gray-50 cursor-pointer active:bg-gray-100"
                        onClick={() => handleAddDish(dish.id)}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="font-medium text-sm sm:text-base truncate">{dish.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{dish.category.name}</div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="font-semibold text-blue-600 text-sm sm:text-base">¥{dish.price}</span>
                          <button className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 whitespace-nowrap">
                            添加
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 中间：已点菜品 */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow lg:h-[calc(100vh-140px)] flex flex-col">
              <div className="p-3 sm:p-4 border-b flex-shrink-0">
                <h2 className="font-semibold text-base sm:text-lg">已点菜品</h2>
              </div>
              <div className="p-2 sm:p-4 flex-1 overflow-y-auto max-h-[400px] lg:max-h-none">
                {order.orderItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
                    还没有点菜，从左侧菜单选择吧
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(groupedItems).map(([categoryName, items]) => (
                      <div key={categoryName}>
                        <h3 className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">
                          {categoryName}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center p-2 sm:p-3 border rounded"
                            >
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <span className="font-medium text-sm sm:text-base">{item.dish.name}</span>
                                  {item.isRandom && (
                                    <span className="px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded whitespace-nowrap">
                                      🎲 随机
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                  ¥{item.price} × {item.quantity} = ¥
                                  {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                {isOrderCompleted ? (
                                  <span className="text-gray-500 text-sm">× {item.quantity}</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(item.id, item.quantity - 1)
                                      }
                                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border rounded hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base"
                                    >
                                      -
                                    </button>
                                    <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                                    <button
                                      onClick={() =>
                                        handleUpdateQuantity(item.id, item.quantity + 1)
                                      }
                                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border rounded hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base"
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="ml-1 sm:ml-2 text-red-600 hover:text-red-700 text-xs sm:text-sm px-1 sm:px-0"
                                    >
                                      <span className="hidden sm:inline">删除</span>
                                      <span className="sm:hidden">🗑️</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：价格统计 */}
          <div className="lg:col-span-3 order-3">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-24">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="font-semibold text-base sm:text-lg">订单统计</h2>
                <button
                  onClick={handleCopyDishNames}
                  className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                    copySuccess
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {copySuccess ? '✓ 已复制' : '📋 复制菜品'}
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>菜品数量：</span>
                  <span className="font-medium">{order.orderItems.length} 道</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>总份数：</span>
                  <span className="font-medium">
                    {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} 份
                  </span>
                </div>
                
                {/* 按分类统计 */}
                <div className="pt-2 sm:pt-3 border-t">
                  <div className="text-xs sm:text-sm text-gray-700 font-medium mb-2">分类统计：</div>
                  {Object.entries(groupedItems).map(([categoryName, items]) => {
                    const categoryTotal = items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                    return (
                      <div
                        key={categoryName}
                        className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1"
                      >
                        <span>{categoryName}：</span>
                        <span>¥{categoryTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 sm:pt-3 border-t flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">预估总价：</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    ¥{order.totalPrice.toFixed(2)}
                  </span>
                </div>

                {order.orderItems.some((item) => item.isRandom) && (
                  <div className="pt-2 sm:pt-3 border-t text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-purple-600">🎲</span>
                      <span>随机推荐菜品：</span>
                    </div>
                    {order.orderItems
                      .filter((item) => item.isRandom)
                      .map((item) => (
                        <div key={item.id} className="ml-4 sm:ml-5 text-gray-500 text-xs sm:text-sm">
                          • {item.dish.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 复制历史菜单模态框 */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">选择要添加的历史订单</h2>
            {allOrders.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm sm:text-base">暂无历史订单</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {allOrders.map((o) => (
                  <div
                    key={o.id}
                    className="border rounded p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                    onClick={() => handleCopyOrder(o.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">
                          {new Date(o.orderDate).toLocaleDateString('zh-CN')}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {o.orderItems.length} 道菜
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600 text-sm sm:text-base">
                          ¥{o.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      {o.orderItems
                        .slice(0, 5)
                        .map((item) => item.dish.name)
                        .join('、')}
                      {o.orderItems.length > 5 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4 sm:mt-6">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-3 sm:px-4 py-2 border rounded hover:bg-gray-50 text-sm sm:text-base"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 随机推荐模态框 */}
      {showRandomModal && randomDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎲</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">随机推荐</h2>
              <div className="mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  {randomDish.name}
                </div>
                <div className="text-sm sm:text-base text-gray-600">{randomDish.category.name}</div>
                <div className="text-xl sm:text-2xl font-semibold text-blue-600 mt-2 sm:mt-3">
                  ¥{randomDish.price}
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    handleRandomDish()
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  再换一个
                </button>
                <button
                  onClick={handleAddRandomDish}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  添加到订单
                </button>
              </div>
              <button
                onClick={() => {
                  setShowRandomModal(false)
                  setRandomDish(null)
                }}
                className="mt-3 text-gray-600 hover:text-gray-900 text-xs sm:text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

