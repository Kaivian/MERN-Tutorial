import React from "react";
import { Button, Chip, BadgeProps } from "@heroui/react";
import IconSwitch, { IconName } from "../icons/IconSwitch";

export interface SidebarItem {
  key: string;
  label: string;
  icon: IconName;
  iconSize: number;
  isDisabled?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
  endContent?: React.ReactNode;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface TeamMember {
  key: string;
  name: string;
  avatarChar: string;
  statusColor?: BadgeProps["color"];
  statusContent?: string;
  isInvisibleBadge?: boolean;
  isDisabled?: boolean;
  isHidden?: boolean;
}

// --- DATA ---

export const sidebarSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      {
        key: "home",
        label: "Home",
        icon: "Home",
        iconSize: 32,
        isDisabled: false,
        isHidden: false,
        isSelected: true,
      },
      {
        key: "projects",
        label: "Projects",
        icon: "Projects",
        iconSize: 40,
        isDisabled: false,
        isHidden: false,
        endContent: (
          <Button
            as="span"
            isIconOnly
            variant="light"
            size="sm"
            radius="full"
          >
            <IconSwitch name="Plus" size={25} className="text-default-400" />
          </Button>
        ),
      },
      {
        key: "tasks",
        label: "Tasks",
        icon: "Tasks",
        iconSize: 41,
        isDisabled: false,
        isHidden: false,
        endContent: (
          <Button
            as="span"
            isIconOnly
            variant="light"
            size="sm"
            radius="full"
          >
            <IconSwitch name="Plus" size={25} className="text-default-400" />
          </Button>
        ),
      },
      {
        key: "team",
        label: "Team",
        icon: "Group",
        iconSize: 32,
        isDisabled: false,
        isHidden: false,
      },
      {
        key: "tracker",
        label: "Tracker",
        icon: "Tracker",
        iconSize: 45,
        isDisabled: false,
        isHidden: false,
        endContent: (
          <Chip size="sm" radius="full" className="bg-default/40">
            New
          </Chip>
        ),
      },
    ],
  },
];

export const sidebarSections2: SidebarSection[] = [
  {
    title: "Organization",
    items: [
      {
        key: "cap_table",
        label: "Cap Table",
        icon: "Chart",
        iconSize: 31,
      },
      {
        key: "analytics",
        label: "Analytics",
        icon: "Analytics",
        iconSize: 31,
      },
      {
        key: "perks",
        label: "Perks",
        icon: "Palette",
        iconSize: 36,
        endContent: (
          <Chip size="sm" radius="full" className="bg-default/40">
            3
          </Chip>
        ),
      },
      {
        key: "expenses",
        label: "Expenses",
        icon: "DocumentList",
        iconSize: 31,
      },
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    key: "john",
    name: "John",
    avatarChar: "J",
    statusColor: "default",
    isInvisibleBadge: true,
  },
  {
    key: "cindy",
    name: "Cindy",
    avatarChar: "C",
    statusColor: "success",
    statusContent: "",
  },
  {
    key: "kenvin",
    name: "Kenvin",
    avatarChar: "K",
    statusColor: "danger",
    statusContent: "New",
  },
  {
    key: "smith",
    name: "Smith",
    avatarChar: "S",
    statusColor: "default",
    isInvisibleBadge: true,
  },
  {
    key: "wile",
    name: "Wile",
    avatarChar: "W",
    statusColor: "success",
    statusContent: "",
  },
  {
    key: "ben",
    name: "Ben",
    avatarChar: "B",
    statusColor: "success",
    statusContent: "",
  },
  {
    key: "david",
    name: "David",
    avatarChar: "D",
    statusColor: "default",
    isInvisibleBadge: true,
  },
  {
    key: "brous",
    name: "Brous",
    avatarChar: "B",
    statusColor: "success",
    statusContent: "",
  },
  {
    key: "mike",
    name: "Mike",
    avatarChar: "M",
    statusColor: "default",
    isInvisibleBadge: true,
  },
];