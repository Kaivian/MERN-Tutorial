// client/src/components/sidebar/SidebarData.tsx
import React from "react";
import { InternalIconName } from "../icons/IconSwitch";
import {
  PieChart2, UsersGroupTwoRounded,
  Box, Bus, BillList, Delivery,
  Chart, User, ShieldUser,
} from '@solar-icons/react';
import { siteConfig } from "@/config/site.config";

export interface SidebarItem {
  key: string;
  label: string;
  icon: InternalIconName | React.ElementType;
  iconSize: number;
  isDisabled?: boolean;
  isHidden?: boolean;
  endContent?: React.ReactNode;
  requiredPerms?: readonly string[]; 
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Quản lý",
    items: [
      {
        key: "dashboard",
        label: siteConfig.links.dashboard.label,
        icon: (props) => <PieChart2 {...props}/>,
        iconSize: 31,
      },
      {
        key: "customers",
        label: siteConfig.links.customer.label,
        icon: (props) => <UsersGroupTwoRounded {...props}/>,
        iconSize: 32,
      },
      {
        key: "products",
        label: siteConfig.links.product.label,
        icon: (props) => <Box {...props}/>,
        iconSize: 36,
      },
      {
        key: "trucks",
        label: siteConfig.links.truck.label,
        icon: (props) => <Bus {...props}/>,
        iconSize: 32,
      },
      {
        key: "orders",
        label: siteConfig.links.order.label,
        icon: (props) => <BillList {...props}/>,
        iconSize: 31,
      },
      {
        key: "deliveries",
        label: siteConfig.links.delivery.label,
        icon: (props) => <Delivery {...props}/>,
        iconSize: 31,
      },
      {
        key: "analytics",
        label: siteConfig.links.report.label,
        icon: (props) => <Chart {...props}/>,
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
        icon: (props) => <User {...props}/>,
        iconSize: 31,
        requiredPerms: siteConfig.links.userAccount.requiredPerms,
      },
      {
        key: "roles",
        label: siteConfig.links.role.label,
        icon: (props) => <ShieldUser {...props}/>,
        iconSize: 31,
        requiredPerms: siteConfig.links.role.requiredPerms,
      },
    ],
  },
];