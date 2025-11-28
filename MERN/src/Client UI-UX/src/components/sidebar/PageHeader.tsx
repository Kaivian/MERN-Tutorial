"use client"

import { Button } from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";

interface PageHeaderProps {
  toggleSidebar: () => void;
}

export default function PageHeader({ toggleSidebar }: PageHeaderProps) {
  return (
    <header className="rounded-medium border-small border-divider flex items-center gap-3 p-4">
      <Button
        onPress={toggleSidebar}
        startContent={<IconSwitch name="Sidebar" size={25} className="text-default-500" />}
        isIconOnly
        variant="light"
        size="sm"
        radius="sm"
      />
      <h2 className="text-medium text-default-700 font-medium">Overview</h2>
    </header>
  )
}