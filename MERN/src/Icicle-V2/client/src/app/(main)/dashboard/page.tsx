"use client";

import React from "react";
import { 
  Card, 
  CardBody, 
  Button, 
  User, 
  Navbar, 
  NavbarContent, 
  NavbarItem,
  Chip
} from "@heroui/react";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Package 
} from "lucide-react";
import ThemeSwitchButton from "@/components/theme-switch/ThemeSwitchButton";

/**
 * Dashboard Page component providing a high-level overview of the factory management system.
 * Includes summary cards and a placeholder for detailed analytics.
 */
export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-content2 dark:bg-background transition-colors duration-300">
      
      {/* Sidebar Section */}
      <aside className="w-64 bg-background border-r border-divider hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-primary p-2 rounded-lg">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">ICICLE CMS</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Button variant="flat" color="primary" className="w-full justify-start" startContent={<LayoutDashboard size={18}/>}>
            Dashboard
          </Button>
          <Button variant="light" className="w-full justify-start" startContent={<Package size={18}/>}>
            Inventory
          </Button>
          <Button variant="light" className="w-full justify-start" startContent={<Users size={18}/>}>
            Staff Management
          </Button>
        </nav>

        <div className="pt-6 border-t border-divider">
          <Button variant="light" color="danger" className="w-full justify-start" startContent={<LogOut size={18}/>}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header / Navbar */}
        <Navbar isBordered className="bg-background/70 backdrop-blur-md">
          <NavbarContent justify="start">
            <h2 className="text-lg font-semibold">Overview Analytics</h2>
          </NavbarContent>
          
          <NavbarContent justify="end" className="gap-4">
            <NavbarItem>
              <ThemeSwitchButton />
            </NavbarItem>
            <NavbarItem>
              <User
                name="Kaivian"
                description="Admin Manager"
                avatarProps={{
                  src: "https://i.pravatar.cc/150?u=kaivian",
                }}
              />
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-primary text-white">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-tiny opacity-80 uppercase font-bold">Total Sales</p>
                  <h4 className="text-2xl font-bold">250.5M VNĐ</h4>
                </div>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-success/10 text-success rounded-full">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-tiny text-default-500 uppercase font-bold">Active Orders</p>
                  <h4 className="text-2xl font-bold">42</h4>
                </div>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-full">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-tiny text-default-500 uppercase font-bold">Total Staff</p>
                  <h4 className="text-2xl font-bold">12</h4>
                </div>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="flex flex-row items-center gap-4">
                <div className="p-3 bg-warning/10 text-warning rounded-full">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-tiny text-default-500 uppercase font-bold">Efficiency</p>
                  <h4 className="text-2xl font-bold">94%</h4>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Detailed Content Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardBody className="h-100 flex items-center justify-center border-2 border-dashed border-divider rounded-xl">
                <div className="text-center">
                  <p className="text-default-500">Main Analytics Chart Area</p>
                  <Chip variant="flat" color="primary" className="mt-2">Coming Soon</Chip>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-bold mb-4">Recent Notifications</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-divider last:border-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <div className="text-sm">
                        <p className="font-medium">System Update v1.0.{i}</p>
                        <p className="text-default-400 text-xs">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}