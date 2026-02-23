// data/mock-curriculum.ts

// 1. Định nghĩa Type dựa trên JSON của bạn
export interface AssessmentItem {
  category: string;
  type: string;
  part_count: number;
  weight_percent: number;
  completion_criteria: string;
  details?: {
    question_type: string;
    question_count?: string | number;
    description: string;
  };
}

export interface Subject {
  code: string;
  name_en: string;
  name_vi: string;
  semester: number;
  credit: number;
  assessment_plan: AssessmentItem[];
}

// 2. Mock Data (Lấy mẫu từ JSON thật: Kỳ 1, Kỳ 5, Kỳ 6, Kỳ 9)
export const MOCK_SUBJECTS: Subject[] = [
  // --- KỲ 1: Môn cơ bản (PRF192) ---
  {
    code: "PRF192",
    name_en: "Programming Fundamentals",
    name_vi: "Cơ sở lập trình",
    semester: 1,
    credit: 3,
    assessment_plan: [
      { category: "Assignment", type: "On-going", part_count: 1, weight_percent: 15.0, completion_criteria: "> 0" },
      { category: "Practical Exam", type: "On-going", part_count: 1, weight_percent: 30.0, completion_criteria: "> 0" },
      { category: "Progress test", type: "On-going", part_count: 2, weight_percent: 15.0, completion_criteria: "> 0" },
      { category: "Workshop", type: "On-going", part_count: 5, weight_percent: 10.0, completion_criteria: "> 0" },
      { category: "Final exam", type: "Final exam", part_count: 1, weight_percent: 30.0, completion_criteria: ">= 4" }
    ]
  },
  {
    code: "MAE101",
    name_en: "Mathematics for Engineering",
    name_vi: "Toán cho ngành kỹ thuật",
    semester: 1,
    credit: 3,
    assessment_plan: [
      { category: "Assignments", type: "On-going", part_count: 3, weight_percent: 30.0, completion_criteria: "> 0" },
      { category: "Progress Test", type: "On-going", part_count: 3, weight_percent: 30.0, completion_criteria: "> 0" },
      { category: "Final Exam", type: "Final exam", part_count: 1, weight_percent: 40.0, completion_criteria: ">= 4" }
    ]
  },

  // --- KỲ 2: Môn có nhiều đầu điểm nhỏ (MAD101) ---
  {
      code: "MAD101",
      name_en: "Discrete Mathematics",
      name_vi: "Toán rời rạc",
      semester: 2,
      credit: 3,
      assessment_plan: [
          { category: "Progress Test", type: "On-going", part_count: 3, weight_percent: 30.0, completion_criteria: "> 0" },
          { category: "Assignments", type: "On-going", part_count: 2, weight_percent: 20.0, completion_criteria: "> 0" },
          { category: "Programming", type: "On-going", part_count: 1, weight_percent: 10.0, completion_criteria: "> 0" },
          { category: "Final Exam", type: "Final exam", part_count: 1, weight_percent: 40.0, completion_criteria: ">= 4" }
      ]
  },

  // --- KỲ 5: Môn chuyên ngành nặng (SWT301) ---
  {
    code: "SWT301",
    name_en: "Software Testing",
    name_vi: "Kiểm thử phần mềm",
    semester: 5,
    credit: 3,
    assessment_plan: [
      { category: "Lab", type: "On-going", part_count: 4, weight_percent: 25.0, completion_criteria: "> 0" },
      { category: "Presentation", type: "On-going", part_count: 1, weight_percent: 10.0, completion_criteria: "> 0" },
      { category: "Progress Test", type: "On-going", part_count: 3, weight_percent: 15.0, completion_criteria: "> 0" },
      { category: "Practical Exam", type: "Final exam", part_count: 1, weight_percent: 25.0, completion_criteria: ">= 4" },
      { category: "Theory Exam", type: "Final exam", part_count: 1, weight_percent: 25.0, completion_criteria: ">= 4" }
    ]
  },

  // --- KỲ 6: Đồ án (SWP391) - Cấu trúc điểm đặc biệt ---
  {
    code: "SWP391",
    name_en: "Software Development Project",
    name_vi: "Dự án phát triển phần mềm",
    semester: 6,
    credit: 3,
    assessment_plan: [
      { category: "Assessment 1 (W3)", type: "On-going", part_count: 1, weight_percent: 15.0, completion_criteria: "> 0" },
      { category: "Assessment 2 (W8)", type: "On-going", part_count: 1, weight_percent: 20.0, completion_criteria: "> 0" },
      { category: "Assessment 3 (W10)", type: "On-going", part_count: 1, weight_percent: 25.0, completion_criteria: "> 0" },
      { category: "Final Presentation", type: "Final exam", part_count: 1, weight_percent: 40.0, completion_criteria: ">= 4" }
    ]
  },

  // --- KỲ 9: Chính trị (MLN131) ---
   {
      code: "MLN131",
      name_en: "Scientific socialism",
      name_vi: "Chủ nghĩa xã hội khoa học",
      semester: 9,
      credit: 2,
      assessment_plan: [
          { category: "Assignment", type: "On-going", part_count: 2, weight_percent: 40.0, completion_criteria: "> 0" },
          { category: "Participation", type: "On-going", part_count: 1, weight_percent: 10.0, completion_criteria: "> 0" },
          { category: "Progress tests", type: "On-going", part_count: 1, weight_percent: 20.0, completion_criteria: "> 0" },
          { category: "Final exam", type: "Final exam", part_count: 1, weight_percent: 30.0, completion_criteria: ">= 4" }
      ]
   }
];