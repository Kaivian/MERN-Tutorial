"use client";

import React from "react";
import {
  Avatar,
  User,
  Button,
  ButtonGroup,
  Tooltip,
  Badge,
  ScrollShadow,
} from "@heroui/react";
import IconSwitch from "../icons/IconSwitch";

import {
  sidebarSections,
  teamMembers,
  SidebarItem,
  TeamMember
} from "./SidebarData";

export default function SideBar() {
  return (
    <div className="border-r-small border-divider relative flex h-full max-w-72 flex-1 flex-col p-6">
      <div className="flex flex-col gap-8 flex-1 overflow-hidden">
        {/* --- Phần Cố Định (Logo, User) --- */}
        <section className="flex items-center gap-2">
          <Avatar src="../images/Kaivian Logo.png" />
          <h1 className="text-lg font-semibold">Kaivian</h1>
        </section>

        <section>
          <User
            avatarProps={{
              src: "../images/Avatar.JPG",
              isBordered: true,
            }}
            description="Software Engineer"
            name="Thế Lực"
          />
        </section>

        {/* --- Render Sections --- */}
        {sidebarSections.map((section) => (
          <section key={section.title} className="flex flex-col gap-1">
            <h2 className="text-tiny text-foreground-500">{section.title}</h2>

            {section.items.map((item: SidebarItem) => {
              if (item.isHidden) return null;

              const isItemDisabled = item.isDisabled || false;

              return (
                <Button
                  key={item.key}
                  isDisabled={isItemDisabled}
                  startContent={
                    <IconSwitch
                      name={item.icon}
                      size={item.iconSize}
                      className={isItemDisabled ? "text-default-300" : "text-default-500"}
                    />
                  }
                  endContent={item.endContent}
                  fullWidth
                  size="lg"
                  className={`text-left px-3 gap-2 ${item.key === "home" ? "bg-default/40 hover:bg-default/60" : ""
                    }`}
                  variant="light"
                >
                  <p className={`w-full text-small font-medium ${isItemDisabled ? "text-default-300" : "text-default-500"}`}>
                    {item.label}
                  </p>
                </Button>
              );
            })}
          </section>
        ))}

        {/* --- Render Team --- */}
        <section className="flex flex-col gap-1 flex-1 min-h-0">
          <h2 className="text-tiny text-foreground-500">Your Teams</h2>
          <ScrollShadow className="flex-1 min-h-0" hideScrollBar>
            {[...teamMembers]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((member: TeamMember) => {
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
                    className="text-left px-3"
                    variant="light"
                  >
                    <p className="w-full text-small font-medium text-default-500">
                      {member.name}
                    </p>
                  </Button>
                );
              })}
          </ScrollShadow>
        </section>
      </div>

      {/* --- Footer --- */}
      <footer className="mt-auto pt-4">
        <ButtonGroup fullWidth size="md">
          <Tooltip content="Help & Information" showArrow>
            <Button
              startContent={<IconSwitch name="Info" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Settings" showArrow>
            <Button
              startContent={<IconSwitch name="Settings" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            />
          </Tooltip>
          <Tooltip content="Logout" showArrow>
            <Button
              startContent={<IconSwitch name="Logout" size={25} className="text-default-500" />}
              fullWidth
              className="text-left px-3 gap-2"
              variant="light"
            />
          </Tooltip>
        </ButtonGroup>
      </footer>
    </div>
  );
}