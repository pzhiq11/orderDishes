"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalDishes: number;
  totalCategories: number;
  todayOrders: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalDishes: 0,
    totalCategories: 0,
    todayOrders: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [dishesRes, categoriesRes, ordersRes] = await Promise.all([
        fetch("/api/dishes"),
        fetch("/api/categories"),
        fetch(`/api/orders?date=${new Date().toISOString().split("T")[0]}`),
      ]);

      const dishes = await dishesRes.json();
      const categories = await categoriesRes.json();
      const orders = await ordersRes.json();

      setStats({
        totalDishes: dishes.length,
        totalCategories: categories.length,
        todayOrders: orders.length,
      });
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部标题 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍽️ 点菜管理系统
          </h1>
          <p className="text-gray-600">团队协同点菜，智能推荐，高效便捷</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">菜品总数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalDishes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                🍜
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">菜品分类</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">今日订单</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.todayOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/orders"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 p-8 block"
          >
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">点菜管理</h2>
            <p className="text-gray-600 mb-4">
              创建订单、协同点菜、查看历史订单
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>多人协同点菜</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>复制历史菜单</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>实时价格统计</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>随机推荐菜品</span>
              </li>
            </ul>
            <div className="mt-6 text-blue-600 font-semibold flex items-center">
              开始点菜 →
            </div>
          </Link>

          <Link
            href="/admin/dishes"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 p-8 block"
          >
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">菜品管理</h2>
            <p className="text-gray-600 mb-4">管理菜品分类、价格、库存状态</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>分类管理</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>菜品增删改查</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>价格调整</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>上下架管理</span>
              </li>
            </ul>
            <div className="mt-6 text-blue-600 font-semibold flex items-center">
              管理菜品 →
            </div>
          </Link>
        </div>

        {/* 功能特色 */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">系统特色</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎲</div>
              <h4 className="font-semibold mb-2">随机推荐</h4>
              <p className="text-sm text-gray-600">
                选择困难？让系统帮你随机推荐美味菜品
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="font-semibold mb-2">协同点菜</h4>
              <p className="text-sm text-gray-600">
                多人同时点菜，实时同步，高效便捷
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">智能统计</h4>
              <p className="text-sm text-gray-600">
                自动计算总价，按分类统计，清晰明了
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部 */}
      <div className="text-center py-8 text-gray-600 text-sm">
        <p>PC点菜管理系统 - 让点菜更简单</p>
      </div>
    </main>
  );
}
