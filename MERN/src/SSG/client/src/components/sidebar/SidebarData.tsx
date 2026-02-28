// client/src/components/sidebar/SidebarData.tsx
import React from "react";
import { InternalIconName } from "../icons/IconSwitch";
import {
  User, ShieldUser,
} from '@solar-icons/react';
import { GraduationCap } from 'lucide-react';
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

export const getSidebarSections = (t: (key: string) => string): SidebarSection[] => [
  {
    title: t('sidebar.management') || "Management",
    items: [
      {
        key: "dashboard",
        label: t('links.dashboard'),
        icon: () => <i className="hn hn-home-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "grade",
        label: t('links.grade'),
        icon: () => <i className="hn hn-clipboard-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "grade/chart",
        label: t('links.gradeChart'),
        icon: () => <i className="hn hn-chart-line-solid" style={{ fontSize: '18px' }}></i>,
        isSubItem: true,
      },
      {
        key: "expense",
        label: t('links.expense'),
        icon: () => <i className="hn hn-wallet" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      }
    ],
  },
  {
    title: t('sidebar.todo') || "Todo",
    items: [
      {
        key: "calendar",
        label: t('links.calendar'),
        icon: () => <i className="hn hn-calender-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
      {
        key: "deadline-manager",
        label: t('links.deadlineManager'),
        icon: () => <i className="hn hn-clock-solid" style={{ fontSize: '25px' }}></i>,
        iconSize: 31,
      },
    ],
  },
];

export const getSidebarSections2 = (t: (key: string) => string): SidebarSection[] => [
  {
    title: t('sidebar.admin') || "Quản trị",
    items: [
      {
        key: "user-accounts",
        label: t('links.userAccount'),
        icon: (props) => <User {...props} />,
        iconSize: 31,
        requiredPerms: siteConfig.links.userAccount.requiredPerms,
      },
      {
        key: "roles",
        label: t('links.roles'),
        icon: (props) => <ShieldUser {...props} />,
        iconSize: 31,
        requiredPerms: siteConfig.links.role.requiredPerms,
      },
      {
        key: "curriculums",
        label: t('links.curriculums'),
        icon: (props: React.SVGProps<SVGSVGElement>) => <GraduationCap {...props} />,
        iconSize: 31,
        requiredPerms: siteConfig.links.curriculums.requiredPerms,
      },
    ],
  },
];

