// client/src/components/sidebar/PageHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { SidebarMinimalistic } from '@solar-icons/react'

// UI Components
import {
  Button,
  User,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";

// Icons
import { Bell, Letter, AltArrowDown } from "@solar-icons/react";
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

export default function PageHeader({ toggleSidebar, title }: PageHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { logout } = useLogout({ redirectTo: "/login" });

  // ===========================================================================
  // 1. ACTION HANDLERS
  // ===========================================================================
  
  const handleProfile = () => {
    // Navigate to profile page (Update path as needed)
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
  // 'mod' equals 'Command' on macOS and 'Control' on Windows
  // ===========================================================================

  // ⌘+P: Profile (Prevents Browser Print)
  useHotkeys("mod+p", (e) => { e.preventDefault(); handleProfile(); });

  // ⌘+S: Settings (Prevents Browser Save)
  useHotkeys("mod+s", (e) => { e.preventDefault(); handleSettings(); });

  // ⌘+H: Changelog (Prevents Browser History/Hide)
  useHotkeys("mod+h", (e) => { e.preventDefault(); handleChangeLog(); });

  // ⌘+I: Help
  useHotkeys("mod+i", (e) => { e.preventDefault(); handleHelp(); });

  // ⌘+F: Feedback (Prevents Browser Find)
  useHotkeys("mod+f", (e) => { e.preventDefault(); handleFeedback(); });

  // ⌘+Shift+Q: Logout
  useHotkeys("mod+shift+q", (e) => { e.preventDefault(); handleLogout(); });

  // ===========================================================================
  // 3. RENDER
  // ===========================================================================

  return (
    <header className="rounded-medium border-small border-divider flex items-center justify-between bg-primary dark:bg-background transition-colors duration-200">
      {/* Left Section: Button + Dynamic Title */}
      <div className="flex items-center gap-2 m-4">
        <Button
          onPress={toggleSidebar}
          startContent={<SidebarMinimalistic size={25} className="text-gray-100"/>}
          isIconOnly
          variant="light"
          size="sm"
          radius="sm"
        />
        <h2 className="text-medium text-gray-100 font-medium">{title}</h2>
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
            {/* --- SECTION 1 --- */}
            <DropdownSection showDivider>
              <DropdownItem
                key="profile"
                shortcut="⌘+P"
                startContent={<UserRounded />}
                onPress={handleProfile}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="settings"
                shortcut="⌘+S"
                startContent={<Settings />}
                onPress={handleSettings}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="theme"
                startContent={<Pallete2 />}
                endContent={<ThemeSwitchDropdown className="border-foreground/20 hover:border-foreground/80 text-foreground/80" />}
                // Note: Theme switching is handled inside ThemeSwitchDropdown, 
                // so we don't attach an onPress handler here to avoid conflicts.
                isReadOnly
                className="cursor-default"
              >
                Themes
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 2 --- */}
            <DropdownSection showDivider>
              <DropdownItem
                key="changelog"
                shortcut="⌘+H"
                startContent={<History />}
                onPress={handleChangeLog}
              >
                Change log
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 3 --- */}
            <DropdownSection showDivider>
              <DropdownItem
                key="help"
                shortcut="⌘+I"
                startContent={<QuestionCircle />}
                onPress={handleHelp}
              >
                Info & Help
              </DropdownItem>
              <DropdownItem
                key="feedback"
                shortcut="⌘+F"
                startContent={<InfoSquare />}
                onPress={handleFeedback}
              >
                Feedback
              </DropdownItem>
            </DropdownSection>

            {/* --- SECTION 4 --- */}
            <DropdownSection>
              <DropdownItem
                key="logout"
                shortcut="⌘+⇧+Q"
                startContent={<Logout2 />}
                className="text-danger"
                color="danger"
                onPress={handleLogout}
              >
                Logout
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}