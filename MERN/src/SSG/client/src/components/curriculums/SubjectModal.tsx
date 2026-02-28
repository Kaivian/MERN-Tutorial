/* eslint-disable @typescript-eslint/no-explicit-any */
// client/src/components/curriculums/SubjectModal.tsx
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
import { curriculumService, SubjectData } from "@/services/curriculum.service";

const RETRO_INPUT = "rounded-none border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] bg-white dark:bg-black";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any | null;
  curriculumCode: string;
  onSuccess: () => void;
}

export default function SubjectModal({ isOpen, onClose, subject, curriculumCode, onSuccess }: SubjectModalProps) {
  const isEditMode = !!subject;

  const { control, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm<any>({
    defaultValues: {
      code: "",
      name_vi: "",
      name_en: "",
      credit: 0,
      semester: 1,
      prerequisite: "",
      structure_type: "STANDARD",
      assessment_plan: []
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setValue("code", subject.code);
        setValue("name_vi", subject.name_vi);
        setValue("name_en", subject.name_en);
        setValue("credit", subject.credit);
        setValue("semester", subject.semester);
        setValue("prerequisite", subject.prerequisite || "");
        setValue("structure_type", subject.structure_type || "STANDARD");
        setValue("assessment_plan", subject.assessment_plan || []);
      } else {
        reset();
      }
    }
  }, [isOpen, subject, isEditMode, reset, setValue]);

  const onSubmit = async (data: SubjectData) => {
    try {
      if (isEditMode) {
        await curriculumService.updateSubject(subject.id, data);
        addToast({ title: "Subject updated successfully", color: "success" });
      } else {
        await curriculumService.createSubject(curriculumCode, data);
        addToast({ title: "Subject created successfully", color: "success" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      addToast({ title: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} subject`, color: "danger" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl"
      classNames={{ base: "rounded-none border-4 border-black dark:border-white shadow-pixel dark:shadow-pixel-dark bg-retro-bg dark:bg-retro-bg-dark font-jersey10 tracking-wide" }}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="text-2xl font-bold text-retro-orange uppercase drop-shadow-[2px_2px_0px_#000] border-b-4 border-black dark:border-white bg-retro-orange/10">
            {isEditMode ? "✎ Edit Subject" : "✚ Add New Subject"}
          </ModalHeader>
          <ModalBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="code"
                control={control}
                rules={{ required: "Code is required" }}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    label="Subject Code"
                    placeholder="e.g. PRF192"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                    isInvalid={!!errors.code}
                    errorMessage={errors.code?.message}
                  />
                )}
              />

              <Controller
                name="semester"
                control={control}
                rules={{ required: "Semester is required", min: 1 }}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Semester"
                    placeholder="e.g. 1"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                    isInvalid={!!errors.semester}
                    errorMessage={errors.semester?.message}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />

              <Controller
                name="name_vi"
                control={control}
                rules={{ required: "Vietnamese name is required" }}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    label="Name (Vietnamese)"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                    className="md:col-span-2"
                    isInvalid={!!errors.name_vi}
                    errorMessage={errors.name_vi?.message}
                  />
                )}
              />

              <Controller
                name="name_en"
                control={control}
                rules={{ required: "English name is required" }}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    label="Name (English)"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                    className="md:col-span-2"
                    isInvalid={!!errors.name_en}
                    errorMessage={errors.name_en?.message}
                  />
                )}
              />

              <Controller
                name="credit"
                control={control}
                rules={{ required: "Credits required", min: 0 }}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    type="number"
                    label="Credits"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                    isInvalid={!!errors.credit}
                    errorMessage={errors.credit?.message}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />

              <Controller
                name="prerequisite"
                control={control}
                render={({ field }: any) => (
                  <Input
                    {...field}
                    label="Prerequisite"
                    placeholder="e.g. None or PRF192"
                    classNames={{ inputWrapper: RETRO_INPUT }}
                  />
                )}
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t-4 border-black dark:border-white">
            <Button variant="flat" onPress={onClose}
              className="rounded-none border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-y-[2px] hover:shadow-none transition-transform">
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}
              className="rounded-none border-2 border-black font-bold uppercase shadow-pixel dark:shadow-pixel-dark hover:translate-y-[2px] hover:shadow-pixel-hover dark:hover:shadow-pixel-dark-hover transition-transform">
              {isEditMode ? "Save Changes" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
