export interface PermissionDetail {
  key: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  group: string;
  permissions: PermissionDetail[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: "Dashboard",
    permissions: [
      { key: "dashboard:view", label: "View Dashboard", description: "Access the main dashboard and metrics." }
    ]
  },
  {
    group: "Profile Management",
    permissions: [
      { key: "profile:view", label: "View Profile", description: "View personal profile details." },
      { key: "profile:edit", label: "Edit Profile", description: "Modify personal profile details." }
    ]
  },
  {
    group: "User Management",
    permissions: [
      { key: "users:view", label: "View Users", description: "View the list of users." },
      { key: "users:create", label: "Create Users", description: "Create new user accounts." },
      { key: "users:edit", label: "Edit Users", description: "Modify user details and status." },
      { key: "users:delete", label: "Delete Users", description: "Soft delete or permanently remove users." }
    ]
  },
  {
    group: "Role Management",
    permissions: [
      { key: "roles:view", label: "View Roles", description: "View existing roles and permissions." },
      { key: "roles:create", label: "Create Roles", description: "Create new roles." },
      { key: "roles:edit", label: "Edit Roles", description: "Modify role permissions and details." },
      { key: "roles:delete", label: "Delete Roles", description: "Remove roles from the system." }
    ]
  },
  {
    group: "Expense Dashboard",
    permissions: [
      { key: "expense.dashboard:view", label: "View Dashboard", description: "View overall expense metrics." },
      { key: "expense.dashboard:manage_budget", label: "Manage Budgets", description: "Create and edit limit budgets." }
    ]
  },
  {
    group: "Expense Transactions",
    permissions: [
      { key: "expense.transaction:view", label: "View Transactions", description: "View transaction logs." },
      { key: "expense.transaction:create", label: "Create Transactions", description: "Create transaction logs." },
      { key: "expense.transaction:edit", label: "Edit Transactions", description: "Modify transaction logs." },
      { key: "expense.transaction:delete", label: "Delete Transactions", description: "Delete transaction logs." }
    ]
  },
  {
    group: "Recurring Expenses",
    permissions: [
      { key: "expense.recurring:view", label: "View Recurring", description: "View recurring expenses." },
      { key: "expense.recurring:create", label: "Create Recurring", description: "Create recurring expenses." },
      { key: "expense.recurring:edit", label: "Edit Recurring", description: "Modify recurring expenses." },
      { key: "expense.recurring:delete", label: "Delete Recurring", description: "Delete recurring expenses." }
    ]
  },
  {
    group: "Curriculum Management",
    permissions: [
      { key: "curriculum:view", label: "View Curriculums", description: "View curriculum structures." },
      { key: "curriculum:create", label: "Create Curriculums", description: "Create new curriculums." },
      { key: "curriculum:edit", label: "Edit Curriculums", description: "Modify curriculum details." },
      { key: "curriculum:delete", label: "Delete Curriculums", description: "Remove curriculums." }
    ]
  },
  {
    group: "Grades Management",
    permissions: [
      { key: "grades:view", label: "View Grades", description: "View student grades." },
      { key: "grades:edit", label: "Edit Grades", description: "Modify grades." }
    ]
  },
  {
    group: "Calendar Management",
    permissions: [
      { key: "calendar:view", label: "View Calendar", description: "Access the course and event calendar." }
    ]
  },
  {
    group: "Deadline Management",
    permissions: [
      { key: "deadline:view", label: "View Deadlines", description: "Access and view the deadline schedules." },
      { key: "deadline:create", label: "Create Deadlines", description: "Create new deadline entries." },
      { key: "deadline:edit", label: "Edit Deadlines", description: "Modify existing deadline entries." },
      { key: "deadline:delete", label: "Delete Deadlines", description: "Remove deadline entries." }
    ]
  }
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

export const getPermissionLabel = (key: string): string => {
  for (const group of PERMISSION_GROUPS) {
    const perm = group.permissions.find(p => p.key === key);
    if (perm) return perm.label;
  }
  return key; // fallback to key itself if not found
};
