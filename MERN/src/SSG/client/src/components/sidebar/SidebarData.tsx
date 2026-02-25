// client/src/components/sidebar/SidebarData.tsx
import React from "react";
import { InternalIconName } from "../icons/IconSwitch";
import {
  User, ShieldUser,
} from '@solar-icons/react';
import { siteConfig } from "@/config/site.config";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: InternalIconName | React.ElementType;
  iconSize?: number;
  isDisabled?: boolean;
  isHidden?: boolean;
  isSubItem?: boolean;
  endContent?: React.ReactNode;
  requiredPerms?: readonly string[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Management",
    items: [
      {
        key: "dashboard",
        label: siteConfig.links.dashboard.label,
        icon: () => <i className="hn hn-home-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "grade",
        label: siteConfig.links.grade.label,
        icon: () => <i className="hn hn-clipboard-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "grade/chart",
        label: siteConfig.links.gradeChart.label,
        icon: () => <i className="hn hn-chart-line-solid" style={{ fontSize: '18px' }}></i>,
        isSubItem: true,
      },
      {
        key: "expense",
        label: siteConfig.links.expense.label,
        icon: () => <i className="hn hn-wallet" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      }
    ],
  },
  {
    title: "Todo",
    items: [
      {
        key: "calendar",
        label: siteConfig.links.calendar.label,
        icon: () => <i className="hn hn-calender-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "deadline-manager",
        label: siteConfig.links.deadlineManager.label,
        icon: () => <i className="hn hn-clock-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
    ],
  },
];

export const sidebarSections2: SidebarSection[] = [
  {
    title: "Quản trị",
    items: [
      {
        key: "user-accounts",
        label: siteConfig.links.userAccount.label,
        icon: (props) => <User {...props} />,
        iconSize: 31,
        requiredPerms: siteConfig.links.userAccount.requiredPerms,
      },
      {
        key: "roles",
        label: siteConfig.links.role.label,
        icon: (props) => <ShieldUser {...props} />,
        iconSize: 31,
        requiredPerms: siteConfig.links.role.requiredPerms,
      },
    ],
  },
];