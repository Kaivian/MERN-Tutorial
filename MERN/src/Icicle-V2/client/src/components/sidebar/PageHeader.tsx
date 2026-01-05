"use client"

import { Button, User } from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";

interface PageHeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export default function PageHeader({ toggleSidebar, title }: PageHeaderProps) {
  return (
    <header className="rounded-medium border-small border-divider flex items-center justify-between p-4 bg-background">
      {/* Left Section: Button + Dynamic Title */}
      <div className="flex items-center gap-2">
        <Button
          onPress={toggleSidebar}
          startContent={<IconSwitch name="Sidebar" size={25} className="text-default-500" />}
          isIconOnly
          variant="light"
          size="sm"
          radius="sm"
        />
        {/* Render the title passed via props */}
        <h2 className="text-medium text-default-700 font-medium">{title}</h2>
      </div>

      {/* Right Section: User Profile */}
      <div className="flex items-center h-full">
        <User
          avatarProps={{
            src: "/images/Avatar.JPG",
          }}
          description="Software Engineer"
          name="Thế Lực"
          classNames={{
            base: "flex-row-reverse gap-3",
            wrapper: "hidden md:flex items-end",
            name: "font-medium",
          }}
        />
      </div>
    </header>
  )
}