/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/components/curriculums/AssessmentPlanModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  addToast
} from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { curriculumService } from "@/services/curriculum.service";
import { AssessmentPlanItem } from "@/types/curriculum.types";

const RETRO_INPUT = "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-white dark:bg-black";

interface AssessmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any | null;
  onSuccess: () => void;
}

export default function AssessmentPlanModal({ isOpen, onClose, subject, onSuccess }: AssessmentPlanModalProps) {
  const [plan, setPlan] = useState<AssessmentPlanItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && subject) {
      setPlan(subject.assessment_plan ? [...subject.assessment_plan] : []);
    } else {
      setPlan([]);
    }
  }, [isOpen, subject]);

  const handleAddColumn = () => {
    setPlan([...plan, { category: "New Column", weight_percent: 0, part_count: 1 }]);
  };

  const handleRemoveColumn = (index: number) => {
    const newPlan = [...plan];
    newPlan.splice(index, 1);
    setPlan(newPlan);
  };

  const handleChange = (index: number, field: keyof AssessmentPlanItem, value: any) => {
    const newPlan = [...plan];
    newPlan[index] = { ...newPlan[index], [field]: value };
    setPlan(newPlan);
  };

  const handleSave = async () => {
    if (!subject) return;

    const totalWeight = plan.reduce((sum, item) => sum + (Number(item.weight_percent) || 0), 0);
    if (totalWeight !== 100 && plan.length > 0) {
      addToast({ title: `Total weight is ${totalWeight}%. It should usually be 100%. Saving anyway...`, color: "warning" });
    }

    setIsSaving(true);
    try {
      await curriculumService.updateSubject(subject.id, {
        assessment_plan: plan as unknown as AssessmentPlanItem[]
      });
      addToast({ title: "Assessment plan updated", color: "success" });
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({ title: error.response?.data?.message || "Failed to update assessment plan", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl"
      classNames={{ base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide" }}>
      <ModalContent>
        <>
          <ModalHeader className="text-2xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] border-b-4 border-black dark:border-white bg-retro-orange/10">
            ⚙ Assessment Plan ({subject?.code})
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                color="primary"
                className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform"
                startContent={<Plus className="w-4 h-4" />}
                onClick={handleAddColumn}
              >
                Add Column
              </Button>
            </div>
            <Table
              aria-label="Assessment Plan Table"
              classNames={{
                wrapper: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark p-0 overflow-hidden max-h-[50vh]",
                th: "bg-retro-orange text-black font-bold text-lg uppercase rounded-none border-b-4 border-black dark:border-white py-3",
                td: "text-lg border-b-2 border-black/10 dark:border-white/10 py-2",
              }}
            >
              <TableHeader>
                <TableColumn>CATEGORY (NAME)</TableColumn>
                <TableColumn>WEIGHT (%)</TableColumn>
                <TableColumn>PART COUNT</TableColumn>
                <TableColumn>MIN CRITERIA</TableColumn>
                <TableColumn align="center">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody items={plan} emptyContent={"No grade columns defined yet."}>
                {plan.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        size="sm"
                        value={item.category}
                        onChange={(e) => handleChange(index, 'category', e.target.value)}
                        placeholder="e.g. Final Exam"
                        classNames={{ inputWrapper: RETRO_INPUT }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        type="number"
                        value={item.weight_percent.toString()}
                        onChange={(e) => handleChange(index, 'weight_percent', parseFloat(e.target.value) || 0)}
                        endContent={<span className="text-default-400 text-base font-bold">%</span>}
                        classNames={{ inputWrapper: RETRO_INPUT }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        type="number"
                        value={item.part_count?.toString() || "1"}
                        onChange={(e) => handleChange(index, 'part_count', parseInt(e.target.value) || 1)}
                        classNames={{ inputWrapper: RETRO_INPUT }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        value={item.completion_criteria || ""}
                        onChange={(e) => handleChange(index, 'completion_criteria', e.target.value)}
                        placeholder="e.g. >= 4"
                        classNames={{ inputWrapper: RETRO_INPUT }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip color="danger" content="Remove">
                        <Button isIconOnly size="sm"
                          className="rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-red-100 dark:bg-red-900/20 text-red-500 hover:translate-y-[1px] hover:shadow-none transition-all"
                          onClick={() => handleRemoveColumn(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter className="border-t-4 border-black dark:border-white">
            <Button variant="flat" onPress={onClose}
              className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform">
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={isSaving}
              className="rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover transition-transform">
              Save Assessment Plan
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
