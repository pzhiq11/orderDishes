"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderDate: string;
  status: string;
  totalPrice: number;
  note?: string;
  _count: {
    orderItems: number;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // 自动刷新：每10秒更新一次订单列表
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 10000);

    // 清除定时器
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("获取订单失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderDate: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error("创建订单失败:", error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("确定要删除这个订单吗？")) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("删除订单失败:", error);
    }
  };

  const handleCopyOrderMenu = async (orderId: string) => {
    try {
      // 获取订单详情
      const res = await fetch(`/api/orders/${orderId}`);
      const order = await res.json();
      
      // 提取菜品名称
      const dishNames = order.orderItems.map((item: any) => item.dish.name).join("、");
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(dishNames);
      
      // 显示成功提示
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (error) {
      console.error("复制菜单失败:", error);
      alert("复制失败，请重试");
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "进行中";
      case "COMPLETED":
        return "已完成";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
              <h1 className="text-2xl font-bold mt-3">订单管理</h1>
            </div>
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              创建新订单
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 日期筛选 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">筛选日期：</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 订单列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">暂无订单</p>
            <button
              onClick={handleCreateOrder}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              创建第一个订单
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {new Date(order.orderDate).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <button
                          onClick={() => handleCopyOrderMenu(order.id)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            copiedOrderId === order.id
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                          title="复制菜单"
                        >
                          {copiedOrderId === order.id ? "✓ 已复制" : "📋 复制"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs flex-shrink-0 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">菜品数量：</span>
                      <span className="font-medium">
                        {order._count.orderItems} 道
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">预估价格：</span>
                      <span className="font-semibold text-lg text-blue-600">
                        ¥{order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {order.note && (
                    <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      备注：{order.note}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 transition-colors"
                    >
                      查看详情
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
