// client/src/app/(main)/expense/transactions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Button, Spinner,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input, Select, SelectItem, Textarea, addToast
} from "@heroui/react";
import axiosInstance from "@/utils/axios-client.utils";
import Link from "next/link";

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  paymentMethod: string;
  transactionDate: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isGuideOpen, onOpen: onGuideOpen, onOpenChange: onGuideOpenChange } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE",
    category: "",
    description: "",
    paymentMethod: "CASH",
    transactionDate: new Date().toISOString().split("T")[0] // YYYY-MM-DD
  });

  const [saving, setSaving] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [resTx, resBg] = await Promise.all([
        axiosInstance.get("/expense/transactions"),
        axiosInstance.get("/expense/budgets")
      ]);
      setTransactions(resTx.data);
      setBudgets(resBg.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      amount: "",
      type: "EXPENSE",
      category: "",
      description: "",
      paymentMethod: "CASH",
      transactionDate: new Date().toISOString().split("T")[0]
    });
    onOpen();
  };

  const openEditModal = (t: Transaction) => {
    setIsEditing(true);
    setCurrentId(t._id);
    setFormData({
      amount: t.amount.toString(),
      type: t.type,
      category: t.category,
      description: t.description || "",
      paymentMethod: t.paymentMethod,
      transactionDate: new Date(t.transactionDate).toISOString().split("T")[0]
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/expense/transactions/${id}`);
      addToast({ title: "Success", description: "Deleted successfully", color: "success" });
      fetchTransactions();
    } catch (error) {
      console.error("Failed to delete", error);
      addToast({ title: "Error", description: "Delete failed", color: "danger" });
    }
  };

  const handleSubmit = async (onClose: () => void) => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        transactionDate: new Date(formData.transactionDate).toISOString()
      };

      if (isEditing && currentId) {
        await axiosInstance.put(`/expense/transactions/${currentId}`, payload);
        addToast({ title: "Success", description: "Updated successfully", color: "success" });
      } else {
        await axiosInstance.post("/expense/transactions", payload);
        addToast({ title: "Success", description: "Created successfully", color: "success" });
      }
      fetchTransactions();
      onClose();
    } catch (error: any) {
      console.error("Failed to save transaction", error);
      const msg = error.response?.data?.message || "Failed to save";
      addToast({ title: "Error", description: msg, color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const pixelCardStyle = "border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-none bg-white dark:bg-zinc-800 text-black dark:text-white";

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto font-sans">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-sans font-bold tracking-widest uppercase">
          Chi Tiêu Tức Thì
        </h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button onPress={onGuideOpen} variant="solid" className="bg-emerald-500 text-white border-2 border-black rounded-none font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all font-sans">
            Hướng dẫn
          </Button>
          <Button as={Link} href="/expense" variant="bordered" className="border-2 border-black rounded-none font-bold uppercase">
            Back to Dashboard
          </Button>
          <Button onPress={openAddModal} color="primary" variant="solid" className="border-2 border-black rounded-none font-bold uppercase shadow-[2px_2px_0_rgba(0,0,0,1)]">
            + Add New
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex w-full h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.length === 0 ? (
            <Card className={pixelCardStyle}>
              <CardBody className="p-8 text-center text-gray-500 font-bold uppercase">
                No transactions found. Add one to get started.
              </CardBody>
            </Card>
          ) : (
            transactions.map(t => (
              <Card key={t._id} className={pixelCardStyle}>
                <CardBody className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col w-full md:w-1/3">
                    <span className="font-bold uppercase text-lg">{t.category}</span>
                    <span className="text-sm text-gray-500">{new Date(t.transactionDate).toLocaleDateString()} • {t.paymentMethod}</span>
                    {t.description && <span className="text-sm italic">{t.description}</span>}
                  </div>

                  <div className="flex items-center justify-end w-full md:w-1/3 gap-4">
                    <span className={`text-2xl font-sans font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')} ₫
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" isIconOnly onPress={() => openEditModal(t)} className="bg-yellow-400 border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
                        <i className="hn hn-pen-solid text-black"></i>
                      </Button>
                      <Button size="sm" isIconOnly onPress={() => handleDelete(t._id)} className="bg-red-500 border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
                        <i className="hn hn-trash text-white"></i>
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}

      {/* USER GUIDE MODAL */}
      <Modal isOpen={isGuideOpen} onOpenChange={onGuideOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 p-2 font-sans", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b-4 border-black text-xl font-bold font-sans text-black dark:text-white uppercase">
                Hướng Dẫn: Lịch Sử Giao Dịch
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-3 font-sans text-sm md:text-base leading-relaxed text-black dark:text-white">
                <p><strong>Ghi Chép Mới (+ Add New):</strong> Nhấn vào nút này để ghi lại các khoản thu nhập (INCOME) hoặc chi tiêu (EXPENSE) phát sinh mỗi ngày bên cạnh số tiền tương ứng.</p>
                <p><strong>Phân Loại Quản Lý:</strong> Đừng quên nhập chính xác Danh mục (Category) như Ăn uống, Giải trí, Lương,... để các biểu đồ phân tích bên màn hình Dashboard có thể thống kê đúng số liệu cho bạn theo từng loại và tính phần trăm chính xác nhất.</p>
                <p><strong>Phương Thức Thanh Toán:</strong> Bạn có thể theo dõi xem mình đã trả bằng Tiền Mặt (CASH), chuyển Thẻ Ngân hàng (BANK) hay sử dụng Ví điện tử (E-WALLET).</p>
                <p><strong>Chỉnh sửa / Xóa:</strong> Nút bấm màu vàng cung cấp tùy chọn thay đổi thông tin chưa chính xác, còn nút màu đỏ giúp bạn xóa mọi giao dịch bị sai lệch.</p>
                <p><strong>Quan sát:</strong> Các khoản thu nhập sẽ hiển thị dấu thanh cộng (+), trong khi các khoản chi tiêu sẽ có dấu trừ (-) rõ rệt.</p>
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

      {/* ADD/EDIT MODAL */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: "border-4 border-black rounded-none shadow-[8px_8px_0_rgba(0,0,0,1)] bg-white dark:bg-zinc-900", closeButton: "hover:bg-red-500 border-2 border-transparent hover:border-black rounded-none" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b-4 border-black uppercase font-sans font-bold text-xl">
                {isEditing ? "Edit Transaction" : "New Transaction"}
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-4">
                <div className="flex gap-4">
                  <Select
                    label="Type"
                    placeholder="Select type"
                    selectedKeys={[formData.type]}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    classNames={{ base: "w-1/2", trigger: "border-2 border-black rounded-none" }}
                  >
                    <SelectItem key="EXPENSE">EXPENSE</SelectItem>
                    <SelectItem key="INCOME">INCOME</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Amount (₫)"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    classNames={{ base: "w-1/2", inputWrapper: "border-2 border-black rounded-none" }}
                  />
                </div>

                {formData.type === 'EXPENSE' ? (
                  <Select
                    label="Category (from Budgets)"
                    placeholder="Select a budget category"
                    selectedKeys={formData.category ? [formData.category] : []}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    classNames={{ trigger: "border-2 border-black rounded-none" }}
                  >
                    {[
                      ...budgets.map(b => b.category),
                      ...(formData.category && !budgets.find((b: any) => b.category === formData.category) ? [formData.category] : [])
                    ].map(cat => (
                      <SelectItem key={cat}>{cat}</SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Input
                    label="Category"
                    placeholder="e.g., Salary, Bonus"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                  />
                )}

                <div className="flex gap-4">
                  <Select
                    label="Payment Method"
                    selectedKeys={[formData.paymentMethod]}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    classNames={{ base: "w-1/2", trigger: "border-2 border-black rounded-none" }}
                  >
                    <SelectItem key="CASH">CASH</SelectItem>
                    <SelectItem key="BANK">BANK</SelectItem>
                    <SelectItem key="EWALLET">E-WALLET</SelectItem>
                  </Select>

                  <Input
                    type="date"
                    label="Date"
                    placeholder="Date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                    classNames={{ base: "w-1/2", inputWrapper: "border-2 border-black rounded-none" }}
                  />
                </div>

                <Textarea
                  label="Description (Optional)"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                />

              </ModalBody>
              <ModalFooter className="border-t-4 border-black">
                <Button variant="bordered" onPress={onClose} className="border-2 border-black rounded-none uppercase font-bold">
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleSubmit(onClose)} isLoading={saving} className="border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase font-bold">
                  {saving ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
}
