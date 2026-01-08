// client/src/components/sidebar/PageHeader.tsx
"use client"

import { Button, User, Divider, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";
import ThemeSwitchButton from "../theme-switch/ThemeSwitchButton";
import { Bell, Letter, AltArrowDown } from '@solar-icons/react'
import { useAuth } from "@/providers/auth.provider";

interface PageHeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export default function PageHeader({ toggleSidebar, title }: PageHeaderProps) {
  const { user } = useAuth();
  return (
    <header className="rounded-medium border-small border-divider flex items-center justify-between bg-primary dark:bg-background transition-colors duration-200">
      {/* Left Section: Button + Dynamic Title */}
      <div className="flex items-center gap-2 m-4">
        <Button
          onPress={toggleSidebar}
          startContent={<IconSwitch name="Sidebar" size={25} className="text-gray-100" />}
          isIconOnly
          variant="light"
          size="sm"
          radius="sm"
        />
        {/* Render the title passed via props */}
        <h2 className="text-medium text-gray-100 font-medium">{title}</h2>
        <ThemeSwitchButton />
      </div>

      {/* Right Section: User Profile */}
      <div className="flex items-center h-full m-4">
        <div className="flex items-center gap-1">
          {/* Bell Button */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            disableRipple
            className="bg-transparent data-[hover=true]:bg-transparent text-white hover:text-gray-100/80 transition-colors duration-300"
          >
            <Bell size={22} />
          </Button>

          {/* Letter Button */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            disableRipple
            className="bg-transparent data-[hover=true]:bg-transparent text-white hover:text-gray-100/80 transition-colors duration-300"
          >
            <Letter size={22} />
          </Button>
        </div>

        <Divider orientation="vertical" className="m-4 bg-gray-100/70 dark:bg-divider transition-colors" />

        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="light"
              disableRipple
              className="group h-auto px-2 gap-3 bg-transparent data-[hover=true]:bg-transparent text-white hover:text-gray-100/90 transition-all duration-300"
            >
              <User
                as="div"
                avatarProps={{
                  src: user?.avatarUrl || undefined,
                  alt: "User Avatar",
                  className: "transition-transform duration-300 group-hover:scale-97",
                  showFallback: true,
                }}
                description={user?.email || user?.username || "..."}
                name={user?.fullName || "User"}
                classNames={{
                  wrapper: "hidden md:flex text-start",
                  name: "font-medium text-inherit text-small",
                  description: "text-gray-200 group-hover:text-gray-300 transition-all duration-300 text-tiny",
                }}
              />
              <AltArrowDown size={16} className="opacity-100 group-hover:opacity-70 transition-opacity duration-300" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="new">New file</DropdownItem>
            <DropdownItem key="copy">Copy link</DropdownItem>
            <DropdownItem key="edit">Edit file</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Delete file
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}