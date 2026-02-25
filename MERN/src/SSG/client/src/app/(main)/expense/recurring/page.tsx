// client/src/app/(main)/expense/recurring/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card, CardBody, Button, Spinner,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input, Select, SelectItem, Textarea, Switch, addToast
} from "@heroui/react";
import axiosInstance from "@/utils/axios-client.utils";
import Link from "next/link";

interface RecurringExpense {
  _id: string;
  amount: number;
  category: string;
  frequency: string;
  nextExecutionDate: string;
  isActive: boolean;
  description: string;
}

export default function RecurringExpensesPage() {
  const [recurrings, setRecurrings] = useState<RecurringExpense[]>([]);
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
    category: "",
    frequency: "MONTHLY",
    nextExecutionDate: new Date().toISOString().split("T")[0],
    isActive: true,
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchRecurrings = async () => {
    try {
      setLoading(true);
      const [resRec, resBg] = await Promise.all([
        axiosInstance.get("/expense/recurring"),
        axiosInstance.get("/expense/budgets")
      ]);
      setRecurrings(resRec.data);
      setBudgets(resBg.data);
    } catch (error) {
      console.error("Failed to fetch recurring expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurrings();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      amount: "",
      category: "",
      frequency: "MONTHLY",
      nextExecutionDate: new Date().toISOString().split("T")[0],
      isActive: true,
      description: "",
    });
    onOpen();
  };

  const openEditModal = (r: RecurringExpense) => {
    setIsEditing(true);
    setCurrentId(r._id);
    setFormData({
      amount: r.amount.toString(),
      category: r.category,
      frequency: r.frequency,
      nextExecutionDate: new Date(r.nextExecutionDate).toISOString().split("T")[0],
      isActive: r.isActive,
      description: r.description || "",
    });
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring expense?")) return;
    try {
      await axiosInstance.delete(`/expense/recurring/${id}`);
      addToast({ title: "Success", description: "Deleted successfully", color: "success" });
      fetchRecurrings();
    } catch (error) {
      console.error("Failed to delete", error);
      addToast({ title: "Error", description: "Delete failed", color: "danger" });
    }
  };

  const handleSubmit = async (onClose: () => void) => {
    // Basic validation
    if (!formData.amount || !formData.category || !formData.nextExecutionDate) {
      addToast({ title: "Validation Error", description: "Please fill in all required fields", color: "danger" });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        nextExecutionDate: new Date(formData.nextExecutionDate).toISOString()
      };

      if (isEditing && currentId) {
        await axiosInstance.put(`/expense/recurring/${currentId}`, payload);
        addToast({ title: "Success", description: "Updated successfully", color: "success" });
      } else {
        await axiosInstance.post("/expense/recurring", payload);
        addToast({ title: "Success", description: "Created successfully", color: "success" });
      }
      fetchRecurrings();
      onClose();
    } catch (error: any) {
      console.error("Failed to save recurring expense", error);
      const msg = error.response?.data?.message || "Failed to save";
      addToast({ title: "Error", description: msg, color: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const handleProcessDue = async () => {
    try {
      setProcessing(true);
      const res = await axiosInstance.post("/expense/recurring/process");
      addToast({ title: "Success", description: `Processed ${res.data.processed} due expenses`, color: "success" });
      fetchRecurrings();
    } catch (error: any) {
      console.error("Failed to process", error);
      addToast({ title: "Error", description: "Failed to process due recurring expenses", color: "danger" });
    } finally {
      setProcessing(false);
    }
  };

  const pixelCardStyle = "border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-none bg-white dark:bg-zinc-800 text-black dark:text-white";

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto font-sans">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-sans font-bold tracking-widest uppercase">
          Chi Tiêu Theo Hạn
        </h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button onPress={onGuideOpen} variant="solid" className="bg-emerald-500 text-white border-2 border-black rounded-none font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all font-sans">
            Hướng dẫn
          </Button>
          <Button as={Link} href="/expense" variant="bordered" className="border-2 border-black rounded-none font-bold uppercase">
            Back to Dashboard
          </Button>
          <Button onPress={handleProcessDue} isLoading={processing} color="secondary" variant="solid" className="border-2 border-black rounded-none font-bold uppercase shadow-[2px_2px_0_rgba(0,0,0,1)]">
            Process Due
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
          {recurrings.length === 0 ? (
            <Card className={pixelCardStyle}>
              <CardBody className="p-8 text-center text-gray-500 font-bold uppercase">
                No recurring expenses found. Add one to automate your bills.
              </CardBody>
            </Card>
          ) : (
            recurrings.map(r => (
              <Card key={r._id} className={`${pixelCardStyle} ${!r.isActive ? 'opacity-60' : ''}`}>
                <CardBody className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col w-full md:w-1/3">
                    <span className="font-bold uppercase text-lg">{r.category}</span>
                    <span className="text-sm text-gray-500">
                      Frequency: <span className="font-bold text-black dark:text-white">{r.frequency}</span>
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      Next Due: {new Date(r.nextExecutionDate).toLocaleDateString()}
                    </span>
                    {r.description && <span className="text-sm italic">{r.description}</span>}
                  </div>

                  <div className="flex items-center justify-end w-full md:w-1/3 gap-4">
                    <span className="text-2xl font-sans font-bold text-red-600">
                      {r.amount.toLocaleString('vi-VN')} ₫
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-1 text-xs border-2 border-black font-bold uppercase ${r.isActive ? 'bg-green-400 text-black' : 'bg-gray-300 text-gray-700'}`}>
                        {r.isActive ? 'Active' : 'Paused'}
                      </span>
                      <Button size="sm" isIconOnly onPress={() => openEditModal(r)} className="bg-yellow-400 border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all ml-4">
                        <i className="hn hn-pen-solid text-black"></i>
                      </Button>
                      <Button size="sm" isIconOnly onPress={() => handleDelete(r._id)} className="bg-red-500 border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
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
                Hướng Dẫn: Chi Phí Định Kỳ
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-3 font-sans text-sm md:text-base leading-relaxed text-black dark:text-white">
                <p><strong>Mục Đích:</strong> Tính năng này giúp bạn tự động hóa việc ghi chép các khoản chi phí hoặc thu nhập cố định phải trả/nhận lặp đi lặp lại (Ví dụ: Tiền thuê nhà, Tiền Internet, Thuê bao giải trí Netflix Spotify...).</p>
                <p><strong>Thêm Mới (+ Add New):</strong> Nhập số tiền, tên danh mục, ngày thanh toán tiếp theo và chu kỳ lặp (Như Hàng tuần, Hàng tháng).</p>
                <p><strong>Nút "Process Due":</strong> Nhấn vào nút này để hệ thống tự động kiểm tra xem có hóa đơn định kỳ nào đã đến hạn thu hay chưa. Nếu đến hạn, nó sẽ tự động thêm vào danh sách biến động giao dịch chính thức của bạn.</p>
                <p><strong>Bật/Tắt (Active/Paused):</strong> Bạn có thể tạm thời thu phí ngưng kích hoạt (Paused) một hóa đơn định kỳ nếu tháng này bạn không sử dụng dịch vụ đó mà không cần thiết phải xóa hẳn nó đi khỏi hệ thống.</p>
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
                {isEditing ? "Edit Recurring Expense" : "New Recurring Expense"}
              </ModalHeader>
              <ModalBody className="py-4 flex flex-col gap-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    label="Amount (₫)"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    isRequired
                    classNames={{ base: "w-1/2", inputWrapper: "border-2 border-black rounded-none" }}
                  />
                  <Select
                    label="Frequency"
                    selectedKeys={[formData.frequency]}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    classNames={{ base: "w-1/2", trigger: "border-2 border-black rounded-none" }}
                  >
                    <SelectItem key="WEEKLY">WEEKLY</SelectItem>
                    <SelectItem key="MONTHLY">MONTHLY</SelectItem>
                    <SelectItem key="CUSTOM">CUSTOM</SelectItem>
                  </Select>
                </div>

                <Select
                  label="Category (from Budgets)"
                  placeholder="Select a budget category"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  classNames={{ trigger: "border-2 border-black rounded-none" }}
                  isRequired
                >
                  {[
                    ...budgets.map(b => b.category),
                    ...(formData.category && !budgets.find((b: any) => b.category === formData.category) ? [formData.category] : [])
                  ].map(cat => (
                    <SelectItem key={cat}>{cat}</SelectItem>
                  ))}
                </Select>

                <Input
                  type="date"
                  label="Next Due Date"
                  value={formData.nextExecutionDate}
                  onChange={(e) => setFormData({ ...formData, nextExecutionDate: e.target.value })}
                  isRequired
                  classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                />

                <Textarea
                  label="Description (Optional)"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  classNames={{ inputWrapper: "border-2 border-black rounded-none" }}
                />

                <div className="flex justify-between items-center bg-gray-100 p-3 border-2 border-black">
                  <span className="font-bold uppercase tracking-widest text-sm">Active Status</span>
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                    classNames={{ wrapper: "group-data-[selected=true]:bg-green-500" }}
                  />
                </div>

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
