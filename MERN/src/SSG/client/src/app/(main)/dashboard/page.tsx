"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Spinner, cn } from "@heroui/react";
import Link from "next/link";
import { useAuth } from "@/providers/auth.provider";
import { useTranslation } from "@/i18n";
import { useUserCurriculum } from "@/hooks/useUserCurriculum";
import { useTasks } from "@/hooks/useTasks";
import axiosInstance from "@/utils/axios-client.utils";
import { UserService } from "@/services/user.service";
import { RoleService } from "@/services/role.service";
import { adminCurriculumService } from "@/services/curriculum.service";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { t } = useTranslation();

  // --- Permission Queries ---
  const canViewGrade = hasPermission("read_grades") || hasPermission("personal_grades") || true;
  const canViewExpense = hasPermission("read_expenses") || hasPermission("personal_expenses") || true;
  const canViewTasks = hasPermission("read_tasks") || hasPermission("personal_tasks") || true;

  const canViewUsers = hasPermission("read_users");
  const canViewRoles = hasPermission("read_roles");
  const canViewCurriculum = hasPermission("curriculums:manage");

  // --- Grade Data ---
  const { data: userCurriculum, isLoading: isCurriculumLoading } = useUserCurriculum();
  const termGpa = userCurriculum?.term_gpa;
  const activeSubjects = userCurriculum?.subjects?.length || 0;

  // --- Task/Deadline Data ---
  const { tasks, isLoading: isTasksLoading } = useTasks();
  const upcomingDeadlines = React.useMemo(() => {
    if (!tasks) return [];
    const now = new Date();
    return tasks
      .filter(t => !t.isCompleted && t.endDate)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
      .slice(0, 3);
  }, [tasks]);

  // --- Expense Data ---
  const [expenseSummary, setExpenseSummary] = useState<any>(null);
  const [isExpenseLoading, setIsExpenseLoading] = useState(true);

  // --- Admin Data (Users & Roles) ---
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalRoles: 0,
    loadingUsers: false,
    loadingRoles: false
  });

  // --- Curriculum Admin Data ---
  const [curriculumData, setCurriculumData] = useState({
    totalCategories: 0,
    totalMajors: 0,
    totalClasses: 0,
    loading: false
  });

  useEffect(() => {
    const fetchExpenseDashboard = async () => {
      try {
        setIsExpenseLoading(true);
        const res = await axiosInstance.get("/expense/dashboard");
        setExpenseSummary(res.data);
      } catch (error) {
        console.error("Failed to fetch expense dashboard:", error);
      } finally {
        setIsExpenseLoading(false);
      }
    };
    if (canViewExpense) {
      fetchExpenseDashboard();
    }
  }, [canViewExpense]);

  useEffect(() => {
    const fetchAdminSummaries = async () => {
      if (canViewUsers) {
        setAdminData(prev => ({ ...prev, loadingUsers: true }));
        try {
          const res = await UserService.getUsers({ limit: 1 });
          setAdminData(prev => ({ ...prev, totalUsers: res.data?.totalDocs || 0, loadingUsers: false }));
        } catch (e) {
          setAdminData(prev => ({ ...prev, loadingUsers: false }));
        }
      }

      if (canViewRoles) {
        setAdminData(prev => ({ ...prev, loadingRoles: true }));
        try {
          const res = await RoleService.getRoles(true);
          setAdminData(prev => ({ ...prev, totalRoles: res.data?.roles?.length || 0, loadingRoles: false }));
        } catch (e) {
          setAdminData(prev => ({ ...prev, loadingRoles: false }));
        }
      }
    };

    fetchAdminSummaries();
  }, [canViewUsers, canViewRoles]);

  useEffect(() => {
    const fetchCurriculumSummary = async () => {
      if (!canViewCurriculum) return;
      setCurriculumData(prev => ({ ...prev, loading: true }));
      try {
        const [catRes, majorRes, classRes] = await Promise.all([
          adminCurriculumService.getMajorCategories(),
          adminCurriculumService.getMajors(),
          adminCurriculumService.getClasses()
        ]);
        setCurriculumData({
          totalCategories: catRes.data?.length || 0,
          totalMajors: majorRes.data?.length || 0,
          totalClasses: classRes.data?.length || 0,
          loading: false
        });
      } catch {
        setCurriculumData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchCurriculumSummary();
  }, [canViewCurriculum]);

  const retroCardStyle = "border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-none bg-white dark:bg-zinc-800 text-black dark:text-white transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] duration-200";
  const retroHeaderStyle = "border-b-4 border-black font-jersey10 uppercase tracking-widest text-xl px-4 py-3 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-between";
  const pixelButtonContentStyle = "font-bold tracking-widest uppercase text-sm border-2 border-black rounded-none shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all";

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-10 bg-content2 dark:bg-background transition-colors duration-300 rounded-2xl md:pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-zinc-800 p-6 shadow-pixel dark:shadow-pixel-dark border-4 border-black shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]" />
        <div className="z-10 relative">
          <h1 className="text-4xl font-jersey10 text-[#e6b689] uppercase tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            Welcome, {user?.fullName || user?.username}!
          </h1>
          <p className="text-zinc-500 font-bold text-sm mt-1 uppercase tracking-wider">
            Here is your daily activity overview.
          </p>
        </div>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">

        {/* --- Grade Summary --- */}
        {canViewGrade && (
          <Card className={retroCardStyle}>
            <CardHeader className={retroHeaderStyle}>
              <div className="flex items-center gap-2">
                <i className="hn hn-chart-line text-[#e6b689] text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span>{t('grade.title') || "Academic Grade"}</span>
              </div>
            </CardHeader>
            <CardBody className="p-5 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#e6b689_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1">
                {isCurriculumLoading ? (
                  <div className="flex justify-center items-center h-full"><Spinner color="warning" /></div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-3 shadow-inner">
                      <span className="font-bold text-zinc-500 text-sm uppercase">Current Term GPA</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl text-[#e6b689] font-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                          {termGpa !== undefined && termGpa !== null ? termGpa.toFixed(1) : "-"}
                        </span>
                        <span className="text-zinc-400 font-bold text-sm">/ 10.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-sm text-zinc-600 dark:text-zinc-400">
                      <i className="hn hn-book-open text-xl"></i> {activeSubjects} Active Subjects
                    </div>
                  </div>
                )}
              </div>
              <Button as={Link} href="/grade" className={cn(pixelButtonContentStyle, "mt-4 bg-[#e6b689] text-black w-full shrink-0")}>
                Go to Grades <i className="hn hn-arrow-right ml-1"></i>
              </Button>
            </CardBody>
          </Card>
        )}

        {/* --- Expense Summary --- */}
        {canViewExpense && (
          <Card className={retroCardStyle}>
            <CardHeader className={retroHeaderStyle}>
              <div className="flex items-center gap-2">
                <i className="hn hn-credit-card text-emerald-500 text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span>{t('expense.title') || "Expense Monitor"}</span>
              </div>
            </CardHeader>
            <CardBody className="p-5 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1">
                {isExpenseLoading ? (
                  <div className="flex justify-center items-center h-full"><Spinner color="success" /></div>
                ) : expenseSummary ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 border-2 border-green-600 p-3 shadow-inner">
                      <span className="font-bold text-green-700 dark:text-green-500 text-sm uppercase text-nowrap mr-2">Net Cash</span>
                      <span className="text-xl font-black text-green-700 dark:text-green-400 text-right">
                        {expenseSummary.overview.netCashFlow > 0 ? "+" : ""}
                        {expenseSummary.overview.netCashFlow.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div className="flex justify-between px-1 text-sm font-bold mt-1">
                      <span className="text-zinc-500 uppercase flex items-center gap-1"><i className="hn hn-arrow-down-circle text-red-500"></i> Spent</span>
                      <span className="text-red-500">{expenseSummary.overview.totalExpense.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    {expenseSummary.insights?.financialHealth && (
                      <div className="text-xs uppercase font-bold px-2 py-1 border-2 border-black inline-block mt-1 w-fit shadow-[1px_1px_0_rgba(0,0,0,1)]
                        bg-zinc-100 dark:bg-zinc-800">
                        Health: <span className={
                          expenseSummary.insights.financialHealth === 'GOOD' ? 'text-green-500' :
                            expenseSummary.insights.financialHealth === 'WARNING' ? 'text-yellow-500' : 'text-red-500'
                        }>{expenseSummary.insights.financialHealth}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm font-bold italic h-full flex items-center justify-center">No expense data found.</div>
                )}
              </div>
              <Button as={Link} href="/expense" className={cn(pixelButtonContentStyle, "mt-4 bg-emerald-400 dark:bg-emerald-600 text-black dark:text-white w-full border-black shrink-0")}>
                Go to Expense <i className="hn hn-arrow-right ml-1"></i>
              </Button>
            </CardBody>
          </Card>
        )}

        {/* --- Task/Deadline Summary --- */}
        {canViewTasks && (
          <Card className={cn(retroCardStyle, "md:col-span-2 xl:col-span-1")}>
            <CardHeader className={retroHeaderStyle}>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <i className="hn hn-calendar-check text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span className="text-black dark:text-white">{t('deadlineManager.title') || "Upcoming Deadlines"}</span>
              </div>
            </CardHeader>
            <CardBody className="p-4 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1 flex flex-col justify-start">
                {isTasksLoading ? (
                  <div className="flex justify-center items-center h-full"><Spinner color="secondary" /></div>
                ) : upcomingDeadlines.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {upcomingDeadlines.map((task) => {
                      const daysLeft = Math.ceil((new Date(task.endDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysLeft <= 2 && daysLeft >= 0;
                      const isOverdue = daysLeft < 0;

                      return (
                        <div key={task._id} className="flex justify-between items-center p-2 border-l-4 border-2 border-black bg-white dark:bg-zinc-900 shadow-[2px_2px_0_rgba(0,0,0,1)]"
                          style={{ borderLeftColor: task.color || '#000' }}>
                          <div className="flex flex-col overflow-hidden mr-2">
                            <span className="font-bold text-sm truncate">{task.name}</span>
                            <span className="text-xs text-zinc-500 truncate mt-0.5">
                              {userCurriculum?.subjects?.find(s => s.id === task.subjectId)?.code || "No Subject"}
                            </span>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className={cn(
                              "text-xs font-black uppercase px-2 py-1 border-2 border-black shadow-[1px_1px_0_rgba(0,0,0,1)]",
                              isOverdue ? "bg-red-500 text-white" : isUrgent ? "bg-yellow-400 text-black" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            )}>
                              {isOverdue ? "OVERDUE" : daysLeft === 0 ? "TODAY" : `${daysLeft}d left`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                    <i className="hn hn-check-circle text-4xl mb-2 opacity-30"></i>
                    <span className="font-bold text-sm uppercase">You are all caught up!</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 z-10 w-full shrink-0">
                <Button as={Link} href="/calendar" className={cn(pixelButtonContentStyle, "bg-cyan-500 text-white flex-1 min-w-0")}>
                  <i className="hn hn-calendar"></i> <span className="hidden sm:inline ml-1">Calendar</span>
                </Button>
                <Button as={Link} href="/deadline-manager" className={cn(pixelButtonContentStyle, "bg-violet-500 text-white flex-1 min-w-0")}>
                  <i className="hn hn-view-list"></i> <span className="hidden sm:inline ml-1">Manager</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* --- User Management Summary --- */}
        {canViewUsers && (
          <Card className={retroCardStyle}>
            <CardHeader className={cn(retroHeaderStyle, "bg-cyan-100 dark:bg-cyan-900")}>
              <div className="flex items-center gap-2">
                <i className="hn hn-users-alt text-cyan-600 dark:text-cyan-400 text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span className="text-black dark:text-white uppercase tracking-widest font-bold">User Accounts</span>
              </div>
            </CardHeader>
            <CardBody className="p-5 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1 flex flex-col justify-center gap-4">
                {adminData.loadingUsers ? (
                  <Spinner color="primary" />
                ) : (
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-4 shadow-inner w-full">
                    <span className="font-bold text-zinc-500 text-sm uppercase">Total Users</span>
                    <span className="text-4xl text-cyan-600 dark:text-cyan-400 font-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {adminData.totalUsers}
                    </span>
                  </div>
                )}
              </div>
              <Button as={Link} href="/user-accounts" className={cn(pixelButtonContentStyle, "mt-4 bg-cyan-400 dark:bg-cyan-600 text-black dark:text-white w-full border-black shrink-0")}>
                Manage Users <i className="hn hn-arrow-right ml-1"></i>
              </Button>
            </CardBody>
          </Card>
        )}

        {/* --- Role Management Summary --- */}
        {canViewRoles && (
          <Card className={retroCardStyle}>
            <CardHeader className={cn(retroHeaderStyle, "bg-amber-100 dark:bg-amber-900")}>
              <div className="flex items-center gap-2">
                <i className="hn hn-shield-keyhole text-amber-600 dark:text-amber-400 text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span className="text-black dark:text-white uppercase tracking-widest font-bold">Role Management</span>
              </div>
            </CardHeader>
            <CardBody className="p-5 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1 flex flex-col justify-center gap-4">
                {adminData.loadingRoles ? (
                  <Spinner color="warning" />
                ) : (
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-4 shadow-inner w-full">
                    <span className="font-bold text-zinc-500 text-sm uppercase">Total Roles</span>
                    <span className="text-4xl text-amber-600 dark:text-amber-400 font-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {adminData.totalRoles}
                    </span>
                  </div>
                )}
              </div>
              <Button as={Link} href="/roles" className={cn(pixelButtonContentStyle, "mt-4 bg-amber-400 dark:bg-amber-600 text-black dark:text-white w-full border-black shrink-0")}>
                Manage Roles <i className="hn hn-arrow-right ml-1"></i>
              </Button>
            </CardBody>
          </Card>
        )}

        {/* --- Curriculum Admin Summary --- */}
        {canViewCurriculum && (
          <Card className={retroCardStyle}>
            <CardHeader className={cn(retroHeaderStyle, "bg-orange-100 dark:bg-orange-900")}>
              <div className="flex items-center gap-2">
                <i className="hn hn-book-open text-orange-500 dark:text-orange-400 text-2xl drop-shadow-[1px_1px_0_rgba(0,0,0,1)]"></i>
                <span className="text-black dark:text-white uppercase tracking-widest font-bold">Curriculum Admin</span>
              </div>
            </CardHeader>
            <CardBody className="p-5 flex flex-col justify-between h-full relative overflow-hidden min-h-[220px]">
              <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-size-[20px_20px]" />
              <div className="z-10 flex-1 flex flex-col justify-center gap-3">
                {curriculumData.loading ? (
                  <Spinner color="warning" />
                ) : (
                  <>
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-3 shadow-inner">
                      <span className="font-bold text-zinc-500 text-sm uppercase">Categories</span>
                      <span className="text-3xl text-orange-500 dark:text-orange-400 font-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        {curriculumData.totalCategories}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-2 shadow-inner">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Majors</span>
                        <span className="text-xl text-orange-500 dark:text-orange-400 font-black">{curriculumData.totalMajors}</span>
                      </div>
                      <div className="flex-1 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-black p-2 shadow-inner">
                        <span className="font-bold text-zinc-500 text-xs uppercase">Classes</span>
                        <span className="text-xl text-orange-500 dark:text-orange-400 font-black">{curriculumData.totalClasses}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button as={Link} href="/curriculums" className={cn(pixelButtonContentStyle, "mt-4 bg-orange-400 dark:bg-orange-600 text-black dark:text-white w-full border-black shrink-0")}>
                Manage Curriculums <i className="hn hn-arrow-right ml-1"></i>
              </Button>
            </CardBody>
          </Card>
        )}

      </div>
    </div>
  );
}
