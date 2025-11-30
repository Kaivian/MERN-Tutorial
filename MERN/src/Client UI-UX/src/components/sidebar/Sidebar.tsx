"use client";

import React from "react";
import {
  Avatar,
  // User,
  Button,
  ButtonGroup,
  Tooltip,
  Badge,
  ScrollShadow,
  Divider,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";

import {
  sidebarSections,
  sidebarSections2,
  teamMembers,
  SidebarItem,
  TeamMember,
} from "./SidebarData";

// --- 1. SIDEBAR FULL (PRIORITY MENU SCROLL) ---
const SidebarExpanded = () => {
  return (
    <div className="flex flex-col gap-4 flex-1 overflow-hidden h-full w-full animate-[fadeIn_0.3s_ease-in-out]">

      {/* --- A. PRIMARY AREA (HEADER + MENU) --- */}
      <ScrollShadow className="flex flex-col gap-6 shrink min-h-0 -mx-2 px-2" hideScrollBar>
        {/* Header & User (Luôn đi cùng Menu) */}
        <div className="flex flex-col gap-6 pt-1 mx-2">
          <section className="flex items-center gap-2">
            <Avatar src="../images/Kaivian Logo.png" />
            <h1 className="text-lg font-semibold">Kaivian</h1>
          </section>

          {/* <section>
            <User
              avatarProps={{
                src: "../images/Avatar.JPG",
                isBordered: true,
              }}
              description="Software Engineer"
              name="Thế Lực"
            />
          </section> */}
        </div>

        <Divider className="bg-divider w-full" />

        {/* Menu Sections */}
        <div className="flex flex-col gap-6 pb-2">
          {/* Section 1 */}
          <section className="flex flex-col gap-1">
            {sidebarSections.map((section) => (
              <React.Fragment key={section.title}>
                <h2 className="text-tiny text-foreground-500 mb-1">{section.title}</h2>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;
                  return (
                    <Button
                      key={item.key}
                      isDisabled={item.isDisabled}
                      startContent={
                        <IconSwitch
                          name={item.icon}
                          size={item.iconSize}
                          className={`${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}
                        />
                      }
                      fullWidth
                      size="lg"
                      className={`text-left px-3 gap-2 justify-start ${item.isSelected ? "bg-default-100" : ""}`}
                      variant="light"
                      endContent={item.endContent}
                    >
                      <span className={`text-small font-medium flex-1 text-left ${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}>
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-1">
            {sidebarSections2.map((section) => (
              <React.Fragment key={section.title}>
                <h2 className="text-tiny text-foreground-500 mb-1">{section.title}</h2>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;
                  return (
                    <Button
                      key={item.key}
                      isDisabled={item.isDisabled}
                      startContent={
                        <IconSwitch
                          name={item.icon}
                          size={item.iconSize}
                          className={`${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}
                        />
                      }
                      fullWidth
                      size="lg"
                      className={`text-left px-3 gap-2 justify-start ${item.isSelected ? "bg-default-100" : ""}`}
                      variant="light"
                      endContent={item.endContent}
                    >
                      <span className={`text-small font-medium flex-1 text-left ${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}>
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </React.Fragment>
            ))}
          </section>
        </div>
      </ScrollShadow>

      {/* --- B. SECONDARY AREA (TEAMS) --- */}
      {/* flex-1: Chiếm khoảng trống còn lại. Nếu hết chỗ thì bị ép nhỏ lại (hoặc biến mất) */}
      <h2 className="text-tiny text-foreground-500">Your Teams</h2>
      <ScrollShadow className="flex-1 min-h-0 -my-2 -mx-2 px-2" hideScrollBar>
        <section className="flex flex-col gap-1 pb-2">
          {teamMembers.map((member: TeamMember) => {
            if (member.isHidden) return null;
            return (
              <Button
                key={member.key}
                isDisabled={member.isDisabled}
                startContent={
                  <Badge
                    color={member.statusColor || "default"}
                    content={member.statusContent || ""}
                    size="sm"
                    isInvisible={member.isInvisibleBadge}
                  >
                    <Avatar
                      isDisabled={member.isDisabled}
                      isBordered
                      size="sm"
                      radius="md"
                      name={member.avatarChar}
                      className="bg-transparent"
                    />
                  </Badge>
                }
                fullWidth
                size="lg"
                className="text-left px-3 justify-start"
                variant="light"
              >
                <span className="text-small font-medium text-default-500 truncate">
                  {member.name}
                </span>
              </Button>
            );
          })}
        </section>
      </ScrollShadow>

      {/* --- C. FOOTER (FIXED) --- */}
      {/* shrink-0: Không bao giờ bị co lại, luôn neo ở đáy */}
      <footer className="mt-auto pt-2 shrink-0">
        <ButtonGroup fullWidth size="md">
          <Tooltip content="Help & Information" showArrow>
            <Button
              startContent={<IconSwitch name="Info" size={25} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Settings" showArrow>
            <Button
              startContent={<IconSwitch name="Settings" size={25} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Logout" showArrow>
            <Button
              startContent={<IconSwitch name="Logout" size={25} className="text-default-500" />}
              fullWidth
              className="px-0"
              variant="light"
            />
          </Tooltip>
        </ButtonGroup>
      </footer>
    </div>
  );
};

// --- 2. SIDEBAR COLLAPSED (PRIORITY MENU SCROLL) ---
const SidebarCollapsed = () => {
  return (
    <div className="flex flex-col items-center gap-4 flex-1 h-full w-full animate-[fadeIn_0.3s_ease-in-out]">

      {/* --- A. PRIMARY AREA (HEADER + MENU) --- */}
      <ScrollShadow className="flex flex-col gap-4 w-full items-center shrink min-h-0 pt-2" hideScrollBar>

        {/* Header & User */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex justify-center w-full">
            <Avatar src="../images/Kaivian Logo.png" />
          </div>
          {/* <div className="flex justify-center w-full">
            <Tooltip content="Thế Lực (Software Engineer)" placement="right">
              <Avatar
                src="../images/Avatar.JPG"
                isBordered
                size="sm"
                className="cursor-pointer"
              />
            </Tooltip>
          </div> */}
        </div>

        <Divider className="bg-divider w-full" />

        {/* Sections 1 & 2 */}
        <div className="flex flex-col gap-2 w-full items-center pb-2">
          {/* Section 1 */}
          <section className="flex flex-col gap-1 w-full items-center">
            {sidebarSections.map((section) => (
              <React.Fragment key={section.title}>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;
                  return (
                    <Tooltip key={item.key} content={item.label} placement="right">
                      <Button
                        isIconOnly
                        isDisabled={item.isDisabled}
                        size="lg"
                        className={`${item.isSelected ? "bg-default-100" : ""}`}
                        variant="light"
                      >
                        <IconSwitch
                          name={item.icon}
                          size={26}
                          className={`${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}
                        />
                      </Button>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          <Divider className="bg-divider w-full" />

          {/* Section 2 */}
          <section className="flex flex-col gap-1 w-full items-center">
            {sidebarSections2.map((section) => (
              <React.Fragment key={section.title}>
                {section.items.map((item: SidebarItem) => {
                  if (item.isHidden) return null;
                  return (
                    <Tooltip key={item.key} content={item.label} placement="right">
                      <Button
                        isIconOnly
                        isDisabled={item.isDisabled}
                        size="lg"
                        className={`${item.isSelected ? "bg-default-100" : ""}`}
                        variant="light"
                      >
                        <IconSwitch
                          name={item.icon}
                          size={26}
                          className={`${item.isDisabled ? "text-default-300" : "text-default-500"} ${item.isSelected ? "text-foreground" : ""}`}
                        />
                      </Button>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </section>

          <Divider className="bg-divider w-full" />
        </div>
      </ScrollShadow>

      {/* --- B. SECONDARY AREA (TEAMS) --- */}
      {/* Chỉ hiện nếu còn chỗ trống */}
      <ScrollShadow className="flex-1 w-full min-h-0 -my-4" hideScrollBar>
        <section className="flex flex-col gap-1 w-full items-center pb-2">
          {teamMembers.map((member: TeamMember) => {
            if (member.isHidden) return null;
            return (
              <Tooltip key={member.key} content={member.name} placement="right">
                <Button
                  isIconOnly
                  isDisabled={member.isDisabled}
                  size="lg"
                  variant="light"
                >
                  <Badge
                    color={member.statusColor || "default"}
                    content=""
                    size="sm"
                    isInvisible={member.isInvisibleBadge}
                    placement="bottom-right"
                  >
                    <Avatar
                      isDisabled={member.isDisabled}
                      isBordered
                      size="sm"
                      radius="sm"
                      name={member.avatarChar}
                      className="bg-transparent w-7 h-7"
                    />
                  </Badge>
                </Button>
              </Tooltip>
            );
          })}
        </section>
      </ScrollShadow>

      {/* --- C. FOOTER (FIXED) --- */}
      <footer className="shrink-0 flex flex-col gap-1 w-full items-center pb-4 pt-2 border-t-small border-divider">
        <Tooltip content="Help & Information" placement="right">
          <Button isIconOnly variant="light" size="lg">
            <IconSwitch name="Info" size={24} className="text-default-500" />
          </Button>
        </Tooltip>
        <Tooltip content="Settings" placement="right">
          <Button isIconOnly variant="light" size="lg">
            <IconSwitch name="Settings" size={24} className="text-default-500" />
          </Button>
        </Tooltip>
        <Tooltip content="Logout" placement="right">
          <Button isIconOnly variant="light" size="lg">
            <IconSwitch name="Logout" size={24} className="text-default-500" />
          </Button>
        </Tooltip>
      </footer>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SideBar({ isCollapsed = false }) {
  const containerClasses = `
    border-r-small border-divider relative flex h-full flex-col 
    transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] 
    ${isCollapsed ? "w-16 px-2" : "w-72 px-6"} 
    py-6 overflow-hidden bg-background
  `;

  return (
    <div className={containerClasses}>
      {isCollapsed ? (
        <SidebarCollapsed key="collapsed" />
      ) : (
        <SidebarExpanded key="expanded" />
      )}
    </div>
  );
}