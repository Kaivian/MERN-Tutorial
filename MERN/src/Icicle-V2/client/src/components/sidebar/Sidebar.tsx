"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  ButtonGroup,
  Tooltip,
  ScrollShadow,
  Divider,
  Image,
  Drawer,
  DrawerContent,
  DrawerBody,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";
import { useSyncImage } from "@/hooks/generals/useSyncImage";
import {
  sidebarSections,
  sidebarSections2,
  SidebarItem,
} from "./SidebarData";

// ============================================================================
// SHARED: SIDEBAR MENU CONTENT (Used for Desktop Expanded & Mobile)
// ============================================================================

interface SidebarContentProps {
  onItemClick?: () => void; // To close drawer on mobile
}

const SidebarContent = ({ onItemClick }: SidebarContentProps) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 2xl:gap-4 flex-1 overflow-hidden h-full w-full">
      
      {/* Header & Logo */}
      <div className="flex flex-col gap-4 pt-1 mx-2">
        <section className="flex items-center gap-3 h-15 w-full">
           {/* Logo - Adjust size via class if needed */}
          <div className="h-10 w-full flex items-center">
             <Image
                {...useSyncImage("/logo-name.png")}
                alt="logo"
              />
          </div>
        </section>
      </div>

      <Divider className="bg-divider w-full" />

      {/* Primary Menu Area */}
      <ScrollShadow className="flex flex-col gap-4 2xl:gap-6 shrink min-h-0 -mx-2 px-2" hideScrollBar>
        <div className="flex flex-col gap-4 2xl:gap-6 pb-2">
          
          {/* Loop through Sections */}
          {[sidebarSections, sidebarSections2].map((sections, groupIndex) => (
             <div key={groupIndex} className="flex flex-col gap-4"> 
                {sections.map((section) => (
                  <section key={section.title} className="flex flex-col gap-1 2xl:gap-2">
                    <h2 className="text-tiny text-foreground-500 mb-1 px-2">{section.title}</h2>
                    {section.items.map((item: SidebarItem) => {
                      if (item.isHidden) return null;
                      const isSelected = pathname?.includes(item.key);

                      return (
                        <Button
                          key={item.key}
                          isDisabled={item.isDisabled}
                          onPress={onItemClick} // Close drawer on click (Mobile)
                          startContent={
                            <IconSwitch
                              name={item.icon}
                              size={20}
                              className={`w-5 h-5 xl:w-7 xl:h-7 2xl:w-10 2xl:h-10 ${isSelected ? "text-primary dark:text-default-900" : ""}`}
                            />
                          }
                          fullWidth
                          size="lg"
                          className={`h-9 xl:h-10 2xl:h-12 text-left px-3 gap-3 justify-start ${isSelected ? "bg-primary/15 dark:bg-gray-100/15" : ""}`}
                          variant="light"
                          endContent={item.endContent}
                        >
                          <span className={`text-small 2xl:text-medium font-medium flex-1 text-left ${isSelected ? "text-primary dark:text-default-900" : ""}`}>
                            {item.label}
                          </span>
                        </Button>
                      );
                    })}
                  </section>
                ))}
             </div>
          ))}

        </div>
      </ScrollShadow>

      {/* Footer (Fixed) */}
      <footer className="mt-auto w-full">
        <ButtonGroup fullWidth variant="light" className="border-t border-divider pt-2">
          <Tooltip content="Help & Information" showArrow>
            <Button isIconOnly startContent={<IconSwitch name="Info" />} className="flex-1" />
          </Tooltip>
          <Tooltip content="Cài đặt" showArrow>
            <Button isIconOnly startContent={<IconSwitch name="Settings" />} className="flex-1" />
          </Tooltip>
          <Tooltip content="Đăng xuất" showArrow color="danger">
            <Button isIconOnly startContent={<IconSwitch name="Logout" />} className="flex-1" />
          </Tooltip>
        </ButtonGroup>
      </footer>
    </div>
  );
};

// ============================================================================
// COMPONENT: SIDEBAR COLLAPSED (Desktop Only)
// ============================================================================
const SidebarCollapsed = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center gap-3 2xl:gap-4 flex-1 h-full w-full animate-[fadeIn_0.3s_ease-in-out]">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full pt-1">
        <div className="flex justify-center w-10 h-10">
           <Image {...useSyncImage("/logo.png")} alt="logo" className="w-full h-full object-contain" />
        </div>
      </div>

      <Divider className="bg-divider w-full" />

      {/* Menu Icons */}
      <ScrollShadow className="flex flex-col gap-2 2xl:gap-4 w-full items-center shrink min-h-0" hideScrollBar>
        {[sidebarSections, sidebarSections2].map((sections, idx) => (
          <React.Fragment key={idx}>
             {sections.map(section => (
                <section key={section.title} className="flex flex-col gap-1 w-full items-center">
                   {section.items.map((item) => {
                      if (item.isHidden) return null;
                      const isSelected = pathname?.includes(item.key);
                      return (
                        <Tooltip key={item.key} content={item.label} placement="right">
                          <Button
                            isIconOnly
                            isDisabled={item.isDisabled}
                            size="md"
                            className={`w-11 h-11 2xl:w-12 2xl:h-12 ${isSelected ? "bg-primary/15 dark:bg-gray-100/15" : ""}`}
                            variant="light"
                          >
                            <IconSwitch
                              name={item.icon}
                              size={22}
                              className={`w-6 h-6 ${isSelected ? "text-primary dark:text-default-900" : ""}`}
                            />
                          </Button>
                        </Tooltip>
                      );
                   })}
                </section>
             ))}
             {idx === 0 && <Divider className="bg-divider w-8" />}
          </React.Fragment>
        ))}
      </ScrollShadow>

      {/* Footer */}
      <footer className="shrink-0 flex flex-col gap-1 w-full items-center pb-4 pt-2 border-t-small border-divider mt-auto">
        <Button isIconOnly variant="light" size="md"><IconSwitch name="Settings" size={22}/></Button>
      </footer>
    </div>
  );
};

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileChange: (open: boolean) => void;
}

export default function SideBar({ isCollapsed, isMobileOpen, onMobileChange }: SidebarProps) {
  
  const desktopClasses = `
    hidden md:flex 
    border-r-small border-divider relative h-full flex-col
    transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] 
    ${isCollapsed ? "w-16 2xl:w-20 px-2" : "w-64 2xl:w-72 px-4 2xl:px-6"} 
    py-4 2xl:py-6 overflow-hidden bg-background shrink-0
  `;

  return (
    <>
      {/* --- A. MOBILE DRAWER --- */}
      <Drawer
        isOpen={isMobileOpen}
        onOpenChange={onMobileChange}
        placement="left"
        size="xs"
        classNames={{
             base: "bg-background", 
             body: "p-4",
        }}
        backdrop="blur"
      >
        <DrawerContent>
          {(onClose) => (
            <DrawerBody>
               <SidebarContent onItemClick={onClose} />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* --- B. DESKTOP SIDEBAR --- */}
      <aside className={desktopClasses}>
        {isCollapsed ? (
          <SidebarCollapsed />
        ) : (
          <div className="animate-[fadeIn_0.3s_ease-in-out] h-full">
             <SidebarContent />
          </div>
        )}
      </aside>
    </>
  );
}