// client/src/app/(main)/expense/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Spinner,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input, addToast
} from "@heroui/react";
import axiosInstance from "@/utils/axios-client.utils";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28CFE', '#FF6B6B'];

export default function ExpenseDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Budget Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Guide Modal State
  const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();
  const [budgetForm, setBudgetForm] = useState({ id: "", category: "", monthlyLimit: "" });
  const [savingBudget, setSavingBudget] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/expense/dashboard");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (onClose: () => void) => {
    if (!budgetForm.category || !budgetForm.monthlyLimit) {
      addToast({ title: "Required", description: "Category and Limit required", color: "danger" });
      return;
    }

    try {
      setSavingBudget(true);
      if (isEditingBudget && budgetForm.id) {
        await axiosInstance.put(`/expense/budgets/${budgetForm.id}`, {
          category: budgetForm.category,
          monthlyLimit: Number(budgetForm.monthlyLimit)
        });
        addToast({ title: "Success", description: "Budget updated!", color: "success" });
      } else {
        await axiosInstance.post("/expense/budgets", {
          category: budgetForm.category,
          monthlyLimit: Number(budgetForm.monthlyLimit)
        });
        addToast({ title: "Success", description: "Budget saved!", color: "success" });
      }
      fetchDashboard();
      onClose();
    } catch (err: any) {
      addToast({ title: "Error", description: err.message || "Failed to save budget", color: "danger" });
    } finally {
      setSavingBudget(false);
    }
  };

  const openBudgetModal = () => {
    setIsEditingBudget(false);
    setBudgetForm({ id: "", category: "", monthlyLimit: "" });
    onOpen();
  };

  const openEditBudgetModal = (b: any) => {
    setIsEditingBudget(true);
    setBudgetForm({ id: b._id, category: b.category, monthlyLimit: b.monthlyLimit.toString() });
    onOpen();
  };

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Retro styles
  const pixelCardStyle = "border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-none bg-white dark:bg-zinc-800 text-black dark:text-white";

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto font-sans pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
        <h1 className="text-3xl font-sans font-bold tracking-widest uppercase">
          Expense Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button onPress={onGuideOpen} variant="solid" className="bg-emerald-500 text-white border-2 border-black rounded-none font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all font-sans">
            Hướng dẫn
          </Button>
          <Button onPress={openBudgetModal} variant="bordered" className="border-2 border-black rounded-none font-bold uppercase shadow-[2px_2px_0_rgba(0,0,0,1)]">
            + Budget
          </Button>
          <Button as={Link} href="/expense/recurring" color="secondary" variant="solid" className="border-2 border-black rounded-none font-bold uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
            Chi Tiêu Theo Hạn
          </Button>
          <Button as={Link} href="/expense/transactions" color="primary" variant="solid" className="border-2 border-black rounded-none font-bold uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
            Chi Tiêu Tức Thì
          </Button>
        </div>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <Card className={`${pixelCardStyle} bg-[#e8f5e9] dark:bg-green-900 border-green-600`}>
              <CardBody className="flex flex-col gap-2 p-4 justify-center items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">Total Income</span>
                <span className="text-3xl font-bold font-sans text-green-700 dark:text-green-400">
                  {summary.overview.totalIncome.toLocaleString('vi-VN')} ₫
                </span>
              </CardBody>
            </Card>

            {/* Total Expense */}
            <Card className={`${pixelCardStyle} bg-[#ffebee] dark:bg-red-900 border-red-600`}>
              <CardBody className="flex flex-col gap-2 p-4 justify-center items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">Total Expense</span>
                <span className="text-3xl font-bold font-sans text-red-700 dark:text-red-400">
                  {summary.overview.totalExpense.toLocaleString('vi-VN')} ₫
                </span>
              </CardBody>
            </Card>

            {/* Net Cash Flow */}
            <Card className={`${pixelCardStyle} bg-[#e3f2fd] dark:bg-blue-900 border-blue-600`}>
              <CardBody className="flex flex-col gap-2 p-4 justify-center items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">Net Cash Flow</span>
                <span className="text-3xl font-bold font-sans text-blue-700 dark:text-blue-400">
                  {summary.overview.netCashFlow.toLocaleString('vi-VN')} ₫
                </span>
              </CardBody>
            </Card>

            {/* Avg Daily Spending */}
            <Card className={pixelCardStyle}>
              <CardBody className="flex flex-col gap-2 p-4 justify-center items-center">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase">Avg Daily Spend</span>
                <span className="text-3xl font-bold font-sans">
                  {summary.overview.avgDailySpending.toLocaleString('vi-VN')} ₫
                </span>
              </CardBody>
            </Card>
          </div>

          {/* Insights Section */}
          <Card className={`${pixelCardStyle} mt-2 bg-gradient-to-r from-[#fff3e0] to-[#ffe0b2] dark:from-orange-950 dark:to-orange-900 border-orange-600`}>
            <CardBody className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold uppercase tracking-widest text-orange-900 dark:text-orange-200">
                  Intelligent Insights
                </h3>
              </div>

              <div className="flex flex-col gap-2 text-sm text-orange-900 dark:text-orange-100">
                <div className="flex items-center gap-2">
                  <strong>Health Status:</strong>
                  <span className={`px-2 py-1 font-bold border-2 border-black text-xs uppercase ${summary.insights.financialHealth === 'GOOD' ? 'bg-green-400 text-black' :
                    summary.insights.financialHealth === 'WARNING' ? 'bg-yellow-400 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                    {summary.insights.financialHealth}
                  </span>
                </div>
                <p><strong>Suggestion:</strong> {summary.insights.suggestion}</p>

                {summary.insights.warnings.length > 0 && (
                  <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 text-red-800 dark:bg-red-950 dark:text-red-200 font-bold">
                    {summary.insights.warnings.map((w: string, i: number) => (
                      <p key={i}>⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
            {/* Top Categories Chart */}
            <Card className={`${pixelCardStyle} min-h-[400px]`}>
              <CardHeader className="p-4 border-b-4 border-black bg-zinc-100 dark:bg-zinc-900">
                <h3 className="text-lg font-bold uppercase tracking-widest">Expense Breakdown</h3>
              </CardHeader>
              <CardBody className="p-4 flex flex-col justify-center items-center w-full">
                {summary.topCategories.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={summary.topCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="totalSpent"
                          nameKey="_id"
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        >
                          {summary.topCategories.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-black stroke-2" />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ border: '4px solid black', borderRadius: '0', backgroundColor: '#fff', color: '#000', fontWeight: 'bold' }}
                          itemStyle={{ color: '#000' }}
                        />
                        <Legend iconType="square" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 italic font-bold">No expenses recorded this month.</p>
                )}
              </CardBody>
            </Card>

            {/* Budget Usage */}
            <Card className={`${pixelCardStyle} min-h-[300px]`}>
              <CardHeader className="p-4 border-b-4 border-black bg-zinc-100 dark:bg-zinc-900">
                <h3 className="text-lg font-bold uppercase tracking-widest">Budget Progress</h3>
              </CardHeader>
              <CardBody className="p-4">
                {summary.budgetUsage.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {summary.budgetUsage.map((b: any, i: number) => {
                      const percent = Math.min(b.percentageUsed, 100);
                      const isWarning = b.percentageUsed >= 80 && b.percentageUsed <= 100;
                      const isDanger = b.percentageUsed > 100;

                      return (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-800 p-2">
                            <div className="flex flex-col">
                              <span className="font-bold text-lg uppercase tracking-wider">{b.category}</span>
                              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                {b.totalSpent.toLocaleString('vi-VN')} ₫ / {b.monthlyLimit.toLocaleString('vi-VN')} ₫
                              </span>
                            </div>
                            <Button size="sm" isIconOnly onPress={() => openEditBudgetModal(b)} className="bg-yellow-400 border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
                              <i className="hn hn-pen-solid text-black"></i>
                            </Button>
                          </div>
                          {/* Retro Progress Bar */}
                          <div className="w-full h-6 bg-gray-200 dark:bg-zinc-700 border-4 border-black relative overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,1)]">
                            <div
                              className={`h-full border-r-4 border-black transition-all duration-500 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-400' : 'bg-[#e6b689]'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center font-sans font-bold text-xs mix-blend-difference text-white drop-shadow-md">
                              {b.percentageUsed.toFixed(0)}% {isDanger && 'OVER!'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <p className="text-gray-500 italic font-bold">No budgets active.</p>
                    <Button onPress={openBudgetModal} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] bg-yellow-400 font-bold uppercase">
                      Create First Budget
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {/* USER GUIDE MODAL */}
      <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2 font-sans", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold font-sans text-black dark:text-white uppercase">
                Hướng Dẫn: Bảng Điều Khiển
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-3 font-sans text-sm md:text-base leading-relaxed text-black dark:text-white">
                <p><strong>Khối Tổng Quan:</strong> Dễ dàng nắm bắt tình hình tài chính trong tháng qua Tổng thu (Thu nhập), Tổng chi (Chi tiêu) và Dòng tiền thuần.</p>
                <p><strong>Gợi Ý Thông Minh:</strong> Dựa vào dữ liệu thu chi thực tế của bạn, hệ thống tự động đưa ra các đánh giá (Tốt, Cảnh báo...) và những lời khuyên hữu ích để bạn quản lý tốt hơn.</p>
                <p><strong>Tiến Độ Ngân Sách:</strong> Thanh tiến độ giúp bạn nhìn rõ mức chi tiêu thực tế so với giới hạn định ra ban đầu. Nếu thanh chuyển sang màu đỏ (OVER!), bạn đã tiêu vượt ngân sách dự kiến cho danh mục đó.</p>
                <p><strong>+ Budget (Thiết Lập Ngân Sách):</strong> Bạn có thể quy định số tiền tối đa được phép tiêu cho từng danh mục cụ thể (vd: Food, Transport...)</p>
              </ModalBody>
              <ModalFooter className="border-t-4 border-black">
                <Button color="primary" onPress={onClose} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] font-bold font-sans uppercase">
                  Đã hiểu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ADD BUDGET MODAL */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b-4 border-black uppercase font-sans font-bold text-xl">
                {isEditingBudget ? "Edit Budget" : "Set Category Budget"}
              </ModalHeader>
              <ModalBody className="py-6 flex flex-col gap-4">
                <Input
                  label="Category"
                  placeholder="e.g., Food, Transport"
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value.toUpperCase() })}
                  classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                  description="Exact match to your transaction categories."
                />
                <Input
                  type="number"
                  label="Monthly Limit (₫)"
                  placeholder="500000"
                  value={budgetForm.monthlyLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })}
                  classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                />
              </ModalBody>
              <ModalFooter className="border-t-4 border-black">
                <Button variant="bordered" onPress={onClose} className="border-2 border-black rounded-none uppercase font-bold">
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleSaveBudget(onClose)} isLoading={savingBudget} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase font-bold">
                  Save Budget
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
