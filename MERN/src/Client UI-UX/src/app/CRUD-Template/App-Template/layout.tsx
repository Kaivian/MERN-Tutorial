import Sidebar from "@/components/sidebar/Sidebar";

export default function AppTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      {/* <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="pt-4 px-4 md:pt-6 md:px-6 flex-1 overflow-auto">
          <PermissionGuard>{children}</PermissionGuard>
        </main>
      </div> */}
    </div>
  );
}