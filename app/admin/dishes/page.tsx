'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  _count?: {
    dishes: number
  }
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

export default function DishesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDishModal, setShowDishModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)

  // 表单数据
  const [dishForm, setDishForm] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    isActive: true,
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchDishes()
  }, [])

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
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/dishes?${params}`)
      const data = await res.json()
      setDishes(data)
    } catch (error) {
      console.error('获取菜品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDishes()
  }, [selectedCategory, searchTerm])

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishForm),
      })
      
      if (res.ok) {
        fetchDishes()
        setShowDishModal(false)
        resetDishForm()
      }
    } catch (error) {
      console.error('创建菜品失败:', error)
    }
  }

  const handleUpdateDish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDish) return

    try {
      const res = await fetch(`/api/dishes/${editingDish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishForm),
      })
      
      if (res.ok) {
        fetchDishes()
        setShowDishModal(false)
        setEditingDish(null)
        resetDishForm()
      }
    } catch (error) {
      console.error('更新菜品失败:', error)
    }
  }

  const handleDeleteDish = async (id: string) => {
    if (!confirm('确定要删除这个菜品吗？')) return

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchDishes()
      }
    } catch (error) {
      console.error('删除菜品失败:', error)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      
      if (res.ok) {
        fetchCategories()
        setShowCategoryModal(false)
        setCategoryForm({ name: '', description: '' })
      }
    } catch (error) {
      console.error('创建分类失败:', error)
    }
  }

  const openEditDish = (dish: Dish) => {
    setEditingDish(dish)
    setDishForm({
      name: dish.name,
      categoryId: dish.categoryId,
      price: dish.price.toString(),
      description: '',
      isActive: dish.isActive,
    })
    setShowDishModal(true)
  }

  const resetDishForm = () => {
    setDishForm({
      name: '',
      categoryId: '',
      price: '',
      description: '',
      isActive: true,
    })
    setEditingDish(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>
              <h1 className="text-2xl font-bold mt-3">菜品管理</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                新增分类
              </button>
              <button
                onClick={() => {
                  resetDishForm()
                  setShowDishModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                新增菜品
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧分类列表 */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">分类筛选</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedCategory === '' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  全部分类
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded flex justify-between ${
                      selectedCategory === cat.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-gray-500 text-sm">{cat._count?.dishes || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧菜品列表 */}
          <div className="col-span-9">
            {/* 搜索框 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <input
                type="text"
                placeholder="搜索菜品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 菜品表格 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">菜品名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">分类</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">价格</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : dishes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        暂无菜品
                      </td>
                    </tr>
                  ) : (
                    dishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{dish.name}</td>
                        <td className="px-4 py-3 text-gray-600">{dish.category.name}</td>
                        <td className="px-4 py-3">¥{dish.price}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              dish.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {dish.isActive ? '上架' : '下架'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditDish(dish)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 菜品编辑模态框 */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingDish ? '编辑菜品' : '新增菜品'}
            </h2>
            <form onSubmit={editingDish ? handleUpdateDish : handleCreateDish}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">菜品名称</label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">分类</label>
                  <select
                    required
                    value={dishForm.categoryId}
                    onChange={(e) => setDishForm({ ...dishForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">价格（元）</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dishForm.isActive}
                      onChange={(e) => setDishForm({ ...dishForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">上架</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDishModal(false)
                    setEditingDish(null)
                    resetDishForm()
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingDish ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 分类创建模态框 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新增分类</h2>
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">分类名称</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述（可选）</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setCategoryForm({ name: '', description: '' })
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

