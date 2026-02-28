/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/components/curriculums/CurriculumModal.tsx
import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { curriculumService, CurriculumData } from "@/services/curriculum.service";

interface CurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: any | null; // null means Add mode
  onSuccess: () => void;
}

export default function CurriculumModal({ isOpen, onClose, curriculum, onSuccess }: CurriculumModalProps) {
  const isEditMode = !!curriculum;

  const { control, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm<CurriculumData>({
    defaultValues: {
      curriculum_info: {
        code: "",
        name_vi: "",
        name_en: "",
        total_credits: 0,
        decision_info: {
          number: "",
          date: ""
        }
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // Pre-fill the form (map from the flattened table data back to API shape)
        setValue("curriculum_info.code", curriculum.key);
        setValue("curriculum_info.name_vi", curriculum.name_vi);
        setValue("curriculum_info.name_en", curriculum.name_en);
        // Since this modal acts on basic list data, full data might need a separate fetch 
        // but for simplicity we allow editing basic info for now.
      } else {
        reset(); // Reset for Add mode
      }
    }
  }, [isOpen, curriculum, isEditMode, reset, setValue]);

  const onSubmit = async (data: CurriculumData) => {
    try {
      if (isEditMode) {
        await curriculumService.updateCurriculum(curriculum.key, data);
        addToast({ title: "Curriculum updated successfully", color: "success" });
      } else {
        await curriculumService.createCurriculum(data);
        addToast({ title: "Curriculum created successfully", color: "success" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({ title: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} curriculum`, color: "danger" });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="flex flex-col gap-1">
              {isEditMode ? "Edit Curriculum" : "Add New Curriculum"}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="curriculum_info.code"
                  control={control}
                  rules={{ required: "Code is required" }}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      label="Curriculum Code"
                      placeholder="e.g. BIT_SE_K19D_K20A"
                      variant="bordered"
                      isInvalid={!!errors.curriculum_info?.code}
                      errorMessage={errors.curriculum_info?.code?.message}
                      disabled={isEditMode} // Usually don't allow changing code if it's primary key
                    />
                  )}
                />

                <Controller
                  name="curriculum_info.total_credits"
                  control={control}
                  rules={{ required: "Total credits is required", min: 0 }}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      type="number"
                      label="Total Credits"
                      placeholder="e.g. 145"
                      variant="bordered"
                      isInvalid={!!errors.curriculum_info?.total_credits}
                      errorMessage={errors.curriculum_info?.total_credits?.message}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />

                <Controller
                  name="curriculum_info.name_vi"
                  control={control}
                  rules={{ required: "Vietnamese name is required" }}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      label="Name (Vietnamese)"
                      placeholder="Chương trình cử nhân..."
                      variant="bordered"
                      className="md:col-span-2"
                      isInvalid={!!errors.curriculum_info?.name_vi}
                      errorMessage={errors.curriculum_info?.name_vi?.message}
                    />
                  )}
                />

                <Controller
                  name="curriculum_info.name_en"
                  control={control}
                  rules={{ required: "English name is required" }}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      label="Name (English)"
                      placeholder="The Bachelor Program..."
                      variant="bordered"
                      className="md:col-span-2"
                      isInvalid={!!errors.curriculum_info?.name_en}
                      errorMessage={errors.curriculum_info?.name_en?.message}
                    />
                  )}
                />

                <Controller
                  name="curriculum_info.decision_info.number"
                  control={control}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      label="Decision Number"
                      placeholder="e.g. 1508/QĐ-ĐHFPT"
                      variant="bordered"
                    />
                  )}
                />

                <Controller
                  name="curriculum_info.decision_info.date"
                  control={control}
                  render={({ field }: any) => (
                    <Input
                      {...field}
                      label="Decision Date"
                      type="date"
                      variant="bordered"
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={isSubmitting}>
                {isEditMode ? "Save Changes" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
