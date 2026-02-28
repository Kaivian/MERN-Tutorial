// client/src/components/curriculums/admin/EntityModals.tsx
"use client";
/**
 * Reusable modals for creating/editing MajorCategory, Major, and AdminClass.
 * Styled with retro pixel 8-bit aesthetic.
 */
import React, { useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, SelectItem, addToast
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { MajorCategory, Major, AdminClass } from "@/types/curriculum.types";
import { adminCurriculumService } from "@/services/curriculum.service";

// Shared retro modal classes
const MODAL_CLASSES = {
  base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide",
  header: "text-2xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] border-b-4 border-black dark:border-white bg-retro-orange/10",
  body: "gap-4 p-6",
  input: "rounded-none border-2 border-black dark:border-white font-jersey10 text-lg",
  inputWrapper: "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-white dark:bg-black",
  btnCancel: "rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform",
  btnSubmit: "rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover transition-transform",
} as const;

// ==================== MAJOR CATEGORY MODAL ====================
interface MajorCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MajorCategory | null;
}

export function MajorCategoryModal({ isOpen, onClose, item }: MajorCategoryModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ code: "", name: "", description: "", color: "#6366f1" });
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (item) {
      setForm({ code: item.code, name: item.name, description: item.description || "", color: item.color || "#6366f1" });
    } else {
      setForm({ code: "", name: "", description: "", color: "#6366f1" });
    }
  }, [item, isOpen]);

  const handleSubmit = async () => {
    if (!form.code || !form.name) {
      addToast({ title: "Code and name are required", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (item) {
        await adminCurriculumService.updateMajorCategory(item._id, form);
        addToast({ title: "Major category updated", color: "success" });
      } else {
        await adminCurriculumService.createMajorCategory(form);
        addToast({ title: "Major category created", color: "success" });
      }
      await qc.invalidateQueries({ queryKey: ["admin-major-categories"] });
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Error saving", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" classNames={{ base: MODAL_CLASSES.base }}>
      <ModalContent>
        <ModalHeader className={MODAL_CLASSES.header}>
          {item ? "✎ Edit Category" : "✚ New Category"}
        </ModalHeader>
        <ModalBody className={MODAL_CLASSES.body}>
          <div className="flex gap-3">
            <Input label="Code" placeholder="e.g. IT" value={form.code}
              onValueChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} isDisabled={!!item}
              className="w-28" classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
            <Input label="Name" placeholder="e.g. Information Technology" value={form.name}
              onValueChange={v => setForm(f => ({ ...f, name: v }))} className="flex-1"
              classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          </div>
          <Textarea label="Description" placeholder="Optional description..." value={form.description}
            onValueChange={v => setForm(f => ({ ...f, description: v }))} minRows={2}
            classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          <div className="flex items-center gap-3">
            <label className="text-lg text-default-600 uppercase font-bold">Color</label>
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="h-10 w-16 cursor-pointer border-4 border-black rounded-none" />
            <span className="text-base text-default-400 font-mono border-2 border-black px-2 py-1 bg-white dark:bg-black">{form.color}</span>
          </div>
        </ModalBody>
        <ModalFooter className="border-t-4 border-black dark:border-white">
          <Button variant="flat" onPress={onClose} className={MODAL_CLASSES.btnCancel}>Cancel</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading} className={MODAL_CLASSES.btnSubmit}>
            {item ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ==================== MAJOR MODAL ====================
interface MajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: Major | null;
  categories: MajorCategory[];
  defaultCategoryId?: string;
}

export function MajorModal({ isOpen, onClose, item, categories, defaultCategoryId }: MajorModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({ code: "", name: "", description: "", majorCategoryId: defaultCategoryId || "" });
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (item) {
      const catId = typeof item.majorCategoryId === "string" ? item.majorCategoryId : item.majorCategoryId._id;
      setForm({ code: item.code, name: item.name, description: item.description || "", majorCategoryId: catId });
    } else {
      setForm({ code: "", name: "", description: "", majorCategoryId: defaultCategoryId || "" });
    }
  }, [item, isOpen, defaultCategoryId]);

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.majorCategoryId) {
      addToast({ title: "All fields are required", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (item) {
        await adminCurriculumService.updateMajor(item._id, form);
        addToast({ title: "Major updated", color: "success" });
      } else {
        await adminCurriculumService.createMajor({ ...form, majorCategoryId: form.majorCategoryId });
        addToast({ title: "Major created", color: "success" });
      }
      await qc.invalidateQueries({ queryKey: ["admin-majors"] });
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Error saving", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" classNames={{ base: MODAL_CLASSES.base }}>
      <ModalContent>
        <ModalHeader className={MODAL_CLASSES.header}>
          {item ? "✎ Edit Major" : "✚ New Major"}
        </ModalHeader>
        <ModalBody className={MODAL_CLASSES.body}>
          <Select label="Major Category" selectedKeys={form.majorCategoryId ? [form.majorCategoryId] : []}
            onSelectionChange={keys => setForm(f => ({ ...f, majorCategoryId: [...keys][0] as string }))}
            isDisabled={!!item} classNames={{ trigger: MODAL_CLASSES.inputWrapper }}>
            {categories.map(c => <SelectItem key={c._id}>{c.name}</SelectItem>)}
          </Select>
          <div className="flex gap-3">
            <Input label="Code" placeholder="e.g. SE" value={form.code}
              onValueChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} isDisabled={!!item}
              className="w-28" classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
            <Input label="Name" placeholder="e.g. Software Engineering" value={form.name}
              onValueChange={v => setForm(f => ({ ...f, name: v }))} className="flex-1"
              classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          </div>
          <Textarea label="Description" placeholder="Optional..." value={form.description}
            onValueChange={v => setForm(f => ({ ...f, description: v }))} minRows={2}
            classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
        </ModalBody>
        <ModalFooter className="border-t-4 border-black dark:border-white">
          <Button variant="flat" onPress={onClose} className={MODAL_CLASSES.btnCancel}>Cancel</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading} className={MODAL_CLASSES.btnSubmit}>
            {item ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ==================== CLASS MODAL ====================
interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: AdminClass | null;
  majors: Major[];
  defaultMajorId?: string;
}

export function ClassModal({ isOpen, onClose, item, majors, defaultMajorId }: ClassModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState({
    code: "", name: "", majorId: defaultMajorId || "",
    intake: "", academicYear: "", totalSemesters: "9", notes: ""
  });
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (item) {
      const majorId = typeof item.majorId === "string" ? item.majorId : item.majorId._id;
      setForm({
        code: item.code, name: item.name, majorId,
        intake: item.intake || "", academicYear: item.academicYear || "",
        totalSemesters: String(item.totalSemesters || 9), notes: item.notes || ""
      });
    } else {
      setForm({ code: "", name: "", majorId: defaultMajorId || "", intake: "", academicYear: "", totalSemesters: "9", notes: "" });
    }
  }, [item, isOpen, defaultMajorId]);

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.majorId) {
      addToast({ title: "Code, name and major are required", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, totalSemesters: parseInt(form.totalSemesters) || 9, majorId: form.majorId };
      if (item) {
        await adminCurriculumService.updateClass(item._id, payload);
        addToast({ title: "Class updated", color: "success" });
      } else {
        await adminCurriculumService.createClass(payload as { majorId: string } & Partial<AdminClass>);
        addToast({ title: "Class created", color: "success" });
      }
      await qc.invalidateQueries({ queryKey: ["admin-classes"] });
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast({ title: err?.response?.data?.message || "Error saving", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" classNames={{ base: MODAL_CLASSES.base }}>
      <ModalContent>
        <ModalHeader className={MODAL_CLASSES.header}>
          {item ? "✎ Edit Class" : "✚ New Class"}
        </ModalHeader>
        <ModalBody className={MODAL_CLASSES.body}>
          <Select label="Major" selectedKeys={form.majorId ? [form.majorId] : []}
            onSelectionChange={keys => setForm(f => ({ ...f, majorId: [...keys][0] as string }))}
            isDisabled={!!item} classNames={{ trigger: MODAL_CLASSES.inputWrapper }}>
            {majors.map(m => <SelectItem key={m._id}>{m.name} ({m.code})</SelectItem>)}
          </Select>
          <div className="flex gap-3">
            <Input label="Code" placeholder="e.g. BIT_SE_K19" value={form.code}
              onValueChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} isDisabled={!!item}
              className="flex-1" classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
            <Input label="Intake" placeholder="e.g. K19" value={form.intake}
              onValueChange={v => setForm(f => ({ ...f, intake: v }))} className="w-28"
              classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          </div>
          <Input label="Name" placeholder="e.g. SE K19 Class A" value={form.name}
            onValueChange={v => setForm(f => ({ ...f, name: v }))}
            classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          <div className="flex gap-3">
            <Input label="Academic Year" placeholder="e.g. 2019-2023" value={form.academicYear}
              onValueChange={v => setForm(f => ({ ...f, academicYear: v }))} className="flex-1"
              classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
            <Input type="number" label="Total Semesters" value={form.totalSemesters}
              onValueChange={v => setForm(f => ({ ...f, totalSemesters: v }))} className="w-36" min={1} max={12}
              classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
          </div>
          <Textarea label="Notes" placeholder="Optional notes..." value={form.notes}
            onValueChange={v => setForm(f => ({ ...f, notes: v }))} minRows={2}
            classNames={{ inputWrapper: MODAL_CLASSES.inputWrapper }} />
        </ModalBody>
        <ModalFooter className="border-t-4 border-black dark:border-white">
          <Button variant="flat" onPress={onClose} className={MODAL_CLASSES.btnCancel}>Cancel</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading} className={MODAL_CLASSES.btnSubmit}>
            {item ? "Save Changes" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
