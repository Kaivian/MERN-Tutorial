// client/src/components/sidebar/PageHeader.tsx
"use client"

import IconSwitch from "../icons/IconSwitch";
import ThemeSwitchButton from "../theme-switch/ThemeSwitchButton";
import { Bell, Letter, AltArrowDown } from '@solar-icons/react'
import { useAuth } from "@/providers/auth.provider";
import { useLogout } from "@/hooks/auth/useLogout";
import ThemeSwitchDropdown from "../theme-switch/ThemeSwitchDropDown";
import {
  Button, User, Divider, Dropdown,
  DropdownTrigger, DropdownMenu, DropdownItem,
  DropdownSection
} from "@heroui/react";
import {
  UserRounded, Settings, Logout2,
  InfoSquare, QuestionCircle,
  UsersGroupTwoRounded, History,
  Pallete2
} from '@solar-icons/react'

interface PageHeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export default function PageHeader({ toggleSidebar, title }: PageHeaderProps) {
  const { user } = useAuth();

  const { logout, isLoading } = useLogout({ redirectTo: "/login" });
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

        <Dropdown closeOnSelect={false}>
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
          <DropdownMenu aria-label="User Menu">
            <DropdownSection showDivider>
              <DropdownItem
                closeOnSelect
                key="profile"
                shortcut="⌘+P"
                startContent={<UserRounded />}
              >
                Xem Hồ Sơ
              </DropdownItem>
              <DropdownItem
                closeOnSelect
                key="settings"
                shortcut="⌘+S"
                startContent={<Settings />}
              >
                Cài Đặt
              </DropdownItem>
              <DropdownItem
                key="theme"
                startContent={<Pallete2 />}
                endContent={<ThemeSwitchDropdown className="border-foreground/20 hover:border-foreground/80 text-foreground/80" />}
              >
                Giao diện
              </DropdownItem>
            </DropdownSection>
            <DropdownSection showDivider>
              <DropdownItem
                closeOnSelect
                key="profile"
                shortcut="⌘+H"
                startContent={<History />}
              >
                Nhật ký thay đổi
              </DropdownItem>
              <DropdownItem
                closeOnSelect
                key="settings"
                shortcut="⌘+T"
                startContent={<UsersGroupTwoRounded />}
              >
                Thành viên nhóm
              </DropdownItem>
            </DropdownSection>
            <DropdownSection showDivider>
              <DropdownItem
                closeOnSelect
                key="help"
                shortcut="⌘+I"
                startContent={<QuestionCircle />}
              >
                Thông tin & Trợ giúp
              </DropdownItem>
              <DropdownItem
                closeOnSelect
                key="feedback"
                shortcut="⌘+F"
                startContent={<InfoSquare />}
              >
                Đóng góp ý kiến
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                closeOnSelect
                key="logout"
                shortcut="⌘+⇧+Q"
                startContent={<Logout2 />}
                className="text-danger"
                color="danger"
                onPress={logout}
              >
                Đăng Xuất
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}