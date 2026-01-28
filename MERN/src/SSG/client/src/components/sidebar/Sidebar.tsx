"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Tooltip,
  ScrollShadow,
  Divider,
  Drawer,
  DrawerContent,
  DrawerBody,
  Link,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";
import { useSidebarMenu } from "@/hooks/generals/useSidebarMenu";
import { SidebarItem, SidebarSection } from "./SidebarData";

// ============================================================================
// SHARED: SIDEBAR MENU CONTENT
// ============================================================================

interface SidebarContentProps {
  onItemClick?: () => void;
  menuGroup1: SidebarSection[];
  menuGroup2: SidebarSection[];
}

const SidebarContent = ({ menuGroup1, menuGroup2 }: SidebarContentProps) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 2xl:gap-4 flex-1 overflow-hidden h-full w-full">
      <div className="flex flex-col gap-4 pt-1 mx-2">
        <section className="flex items-center gap-3 h-15 w-full">
          <div className="h-10 w-full flex items-center">
            <h1 className="text-[34px] font-bold text-retro-orange [text-shadow:2px_2px_0_#c47c16] whitespace-nowrap">
              FPT UNIMATE
            </h1>
          </div>
        </section>
      </div>

      <Divider className="bg-divider w-full" />

      <ScrollShadow className="flex flex-col gap-4 2xl:gap-6 shrink min-h-0 -mx-2 px-2" hideScrollBar>
        <div className="flex flex-col gap-4 2xl:gap-6 pb-2">

          {[menuGroup1, menuGroup2].map((sections, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-4">
              {sections.map((section) => {
                // --- LOGIC MỚI: Lọc item trước ---
                const visibleItems = section.items.filter(item => !item.isHidden);

                // Nếu không có item nào hiển thị, ẩn luôn cả Section (bao gồm Title)
                if (visibleItems.length === 0) return null;

                return (
                  <section key={section.title} className="flex flex-col gap-1 2xl:gap-2">
                    <h2 className="text-tiny text-foreground-500 mb-1 px-2">{section.title}</h2>

                    {/* Map qua danh sách đã lọc (visibleItems) */}
                    {visibleItems.map((item: SidebarItem) => {
                      const isSelected = pathname?.includes(item.key);

                      return (
                        <Button
                          key={item.key}
                          isDisabled={item.isDisabled}
                          as={Link}
                          href={item.key}
                          className={`relative overflow-hidden h-9 xl:h-10 2xl:h-12 text-left px-3 gap-3 justify-start ${isSelected ? "bg-primary/15 dark:bg-gray-100/15" : ""
                            }`}
                          fullWidth
                          radius="md"
                          size="lg"
                          variant="light"
                          startContent={
                            <IconSwitch
                              name={item.icon}
                              size={20}
                              className={`w-5 h-5 xl:w-7 xl:h-7 2xl:w-10 2xl:h-10 ${isSelected ? "text-primary dark:text-default-900" : ""
                                }`}
                            />
                          }
                          endContent={item.endContent}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-primary dark:bg-default-500 rounded-r-small" />
                          )}
                          <span className={`text-small 2xl:text-medium font-medium flex-1 text-left ${isSelected ? "text-primary dark:text-default-900" : ""}`}>
                            {item.label}
                          </span>
                        </Button>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          ))}

        </div>
      </ScrollShadow>
    </div>
  );
};

// ============================================================================
// COMPONENT: SIDEBAR COLLAPSED
// ============================================================================

interface SidebarCollapsedProps {
  menuGroup1: SidebarSection[];
  menuGroup2: SidebarSection[];
}

const SidebarCollapsed = ({ menuGroup1, menuGroup2 }: SidebarCollapsedProps) => {
  const pathname = usePathname();

  // Helper: Kiểm tra xem một nhóm section có item nào hiển thị không
  const hasVisibleItems = (sections: SidebarSection[]) => {
    return sections.some((section) =>
      section.items.some((item) => !item.isHidden)
    );
  };

  // Kiểm tra trước xem group 2 có item nào không để quyết định render Divider
  const isGroup2Visible = hasVisibleItems(menuGroup2);

  return (
    <div className="flex flex-col items-center gap-3 2xl:gap-4 flex-1 h-full w-full animate-[fadeIn_0.3s_ease-in-out]">
      {/* ... Header Logo giữ nguyên ... */}
      <div className="flex flex-col items-center gap-4 w-full pt-1">
        <div className="flex justify-center w-10 h-10">
          <h1 className="text-2xl font-bold text-retro-orange [text-shadow:2px_2px_0_#c47c16]">
            FPT
          </h1>
        </div>
      </div>

      <Divider className="bg-divider w-full" />

      <ScrollShadow className="flex flex-col gap-2 2xl:gap-4 w-full items-center shrink min-h-0" hideScrollBar>
        {[menuGroup1, menuGroup2].map((sections, idx) => (
          <React.Fragment key={idx}>
            {sections.map(section => {
              const visibleItems = section.items.filter(item => !item.isHidden);
              if (visibleItems.length === 0) return null;

              return (
                <section key={section.title} className="flex flex-col gap-1 w-full items-center">
                  {visibleItems.map((item) => {
                    const isSelected = pathname?.includes(item.key);
                    return (
                      <Tooltip key={item.key} content={item.label} placement="right">
                        <Button
                          as={Link}
                          href={item.key}
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
              );
            })}
            {idx === 0 && isGroup2Visible && <Divider className="bg-divider w-8" />}
          </React.Fragment>
        ))}
      </ScrollShadow>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: SIDEBAR
// ============================================================================

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileChange: (open: boolean) => void;
}

export default function SideBar({ isCollapsed, isMobileOpen, onMobileChange }: SidebarProps) {

  const { menuGroup1, menuGroup2 } = useSidebarMenu();

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
              <SidebarContent
                onItemClick={onClose}
                menuGroup1={menuGroup1}
                menuGroup2={menuGroup2}
              />
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>

      {/* --- B. DESKTOP SIDEBAR --- */}
      <aside className={desktopClasses}>
        {isCollapsed ? (
          <SidebarCollapsed
            menuGroup1={menuGroup1}
            menuGroup2={menuGroup2}
          />
        ) : (
          <div className="animate-[fadeIn_0.3s_ease-in-out] h-full">
            <SidebarContent
              menuGroup1={menuGroup1}
              menuGroup2={menuGroup2}
            />
          </div>
        )}
      </aside>
    </>
  );
}