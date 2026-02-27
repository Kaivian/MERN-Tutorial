// client/src/components/sidebar/PageHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { SidebarMinimalistic } from '@solar-icons/react';

import {
  Button,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  cn,
} from "@heroui/react";
import {
  UserRounded,
  Settings,
  Logout2,
  InfoSquare,
  QuestionCircle,
  History,
  Pallete2,
} from "@solar-icons/react";
import ThemeSwitchDropdown from "../theme-switch/ThemeSwitchDropDown";
import { useAuth } from "@/providers/auth.provider";
import { useLogout } from "@/hooks/auth/useLogout";

interface PageHeaderProps {
  toggleSidebar: () => void;
  title: string;
}

// --- RETRO STYLES ---
const pixelBtnStyle = "rounded-none border-2 border-black bg-white hover:bg-[#e6b689] text-black transition-all active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
const iconBtnStyle = "bg-transparent border-2 border-transparent hover:border-black hover:bg-[#e6b689] text-black rounded-none transition-all duration-200";

export default function PageHeader({ toggleSidebar, title }: PageHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useLogout({ redirectTo: "/login" });

  // ===========================================================================
  // 1. ACTION HANDLERS
  // ===========================================================================

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleChangeLog = () => {
    router.push("/changelog");
  };

  const handleHelp = () => {
    router.push("/help");
  };

  const handleFeedback = () => {
    router.push("/feedback");
  };

  const handleLogout = () => {
    logout();
  };

  // ===========================================================================
  // 2. HOTKEYS CONFIGURATION
  // ===========================================================================

  useHotkeys("mod+p", (e) => { e.preventDefault(); handleProfile(); });
  useHotkeys("mod+s", (e) => { e.preventDefault(); handleSettings(); });
  useHotkeys("mod+h", (e) => { e.preventDefault(); handleChangeLog(); });
  useHotkeys("mod+i", (e) => { e.preventDefault(); handleHelp(); });
  useHotkeys("mod+f", (e) => { e.preventDefault(); handleFeedback(); });
  useHotkeys("mod+shift+q", (e) => { e.preventDefault(); handleLogout(); });

  // ===========================================================================
  // 3. RENDER
  // ===========================================================================

  return (
    <header className="rounded-none border-b-4 border-black flex items-center justify-between bg-white dark:bg-zinc-900 transition-colors duration-200 h-20 px-6">
      {/* Left Section: Button + Dynamic Title */}
      <div className="flex items-center gap-4">
        <Button
          onPress={toggleSidebar}
          isIconOnly
          radius="none"
          className={cn("w-10 h-10 min-w-10", pixelBtnStyle)}
        >
          <SidebarMinimalistic size={24} />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">
            {title}
          </h2>
          <div className="h-1 w-full bg-[#e6b689] mt-1"></div>
        </div>
      </div>

      {/* Right Section: User Profile */}
      <div className="flex items-center h-full gap-2">
        <div className="flex items-center gap-2">
          {/* Bell Button */}
          <Button
            isIconOnly
            radius="none"
            size="sm"
            className={cn("w-9 h-9", iconBtnStyle, "dark:text-white dark:hover:text-black")}
          >
            <i className="hn hn-bell" style={{ fontSize: '20px' }}></i>
          </Button>

          {/* Letter Button */}
          <Button
            isIconOnly
            radius="none"
            size="sm"
            className={cn("w-9 h-9", iconBtnStyle, "dark:text-white dark:hover:text-black")}
          >
            <i className="hn hn-envelope" style={{ fontSize: '20px' }}></i>
          </Button>
        </div>

        {/* Retro Divider */}
        <div className="h-8 w-0.5 bg-black dark:bg-zinc-700 mx-2"></div>

        <Dropdown
          closeOnSelect={false}
          className="bg-white dark:bg-zinc-900 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          radius="none"
          classNames={{
            content: "p-0 rounded-none border-2 border-black min-w-[240px]"
          }}
        >
          <DropdownTrigger>
            <Button
              disableRipple
              radius="none"
              className="group h-auto px-3 py-1.5 gap-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-transparent hover:border-black transition-all duration-200"
            >
              <User
                as="div"
                avatarProps={{
                  src: user?.avatarUrl || undefined,
                  alt: "User Avatar",
                  radius: "none", // Square Avatar
                  className: "border-2 border-black transition-transform duration-300 group-hover:scale-105",
                  showFallback: true,
                }}
                description={user?.email || user?.username || "..."}
                name={user?.fullName || "User"}
                classNames={{
                  wrapper: "hidden md:flex text-start",
                  name: "font-bold text-black dark:text-white text-sm uppercase",
                  description: "text-zinc-500 text-[11px]",
                }}
              />
              <i className="hn hn-caret-down text-black dark:text-white group-hover:translate-y-0.5 transition-transform duration-200"></i>
            </Button>
          </DropdownTrigger>

          <DropdownMenu
            aria-label="User Menu"
            itemClasses={{
              base: [
                "rounded-none",
                "font-bold",
                "text-zinc-700 dark:text-zinc-300",
                "data-[hover=true]:bg-[#e6b689]",
                "data-[hover=true]:text-black",
                "data-[hover=true]:font-bold",
                "border-b-2 border-transparent",
                "data-[hover=true]:border-black", // Fake border effect inside
                "transition-none" // Retro feels snappy, not smooth
              ].join(" "),
              shortcut: "text-[11px] font-bold border-2 border-black px-1 rounded-none bg-white text-black shadow-[1px_1px_0_rgba(0,0,0,1)]",
              description: "",
              title: "uppercase tracking-wide text-sm"
            }}
          >
            {/* --- SECTION 1 --- */}
            <DropdownSection showDivider classNames={{ divider: "bg-black h-0.5 my-0" }}>
              <DropdownItem
                key="profile"
                shortcut="⌘P"
                startContent={<UserRounded size={18} />}
                onPress={handleProfile}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="settings"
                shortcut="⌘S"
                startContent={<Settings size={18} />}
                onPress={handleSettings}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="theme"
                startContent={<Pallete2 size={18} />}
                // Custom style for theme switcher container inside dropdown
                endContent={<div className="scale-90 origin-right"><ThemeSwitchDropdown /></div>}
                isReadOnly
                className="cursor-default hover:bg-transparent! hover:border-transparent!"
              >
                THEMES
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 2 --- */}
            <DropdownSection showDivider classNames={{ divider: "bg-black h-0.5 my-0" }}>
              <DropdownItem
                key="changelog"
                shortcut="⌘H"
                startContent={<History size={18} />}
                onPress={handleChangeLog}
              >
                Change log
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 3 --- */}
            <DropdownSection showDivider classNames={{ divider: "bg-black h-0.5 my-0" }}>
              <DropdownItem
                key="help"
                shortcut="⌘I"
                startContent={<QuestionCircle size={18} />}
                onPress={handleHelp}
              >
                Info & Help
              </DropdownItem>
              <DropdownItem
                key="feedback"
                shortcut="⌘F"
                startContent={<InfoSquare size={18} />}
                onPress={handleFeedback}
              >
                Feedback
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 4 --- */}
            <DropdownSection>
              <DropdownItem
                key="logout"
                shortcut="⌘⇧Q"
                startContent={<Logout2 size={18} />}
                className="text-red-600 data-[hover=true]:bg-red-500 data-[hover=true]:text-white font-bold"
                onPress={handleLogout}
              >
                LOGOUT
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
