import React from "react";
import { BadgeProps } from "@heroui/react";
import { InternalIconName } from "../icons/IconSwitch";
import {
  PieChart2, UsersGroupTwoRounded,
  Box, Bus, BillList, Delivery,
  Chart, User, ShieldUser,
} from '@solar-icons/react'

export interface SidebarItem {
  key: string;
  label: string;
  icon: InternalIconName | React.ElementType;
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
    title: "Quản lý",
    items: [
      {
        key: "dashboard",
        label: "Bảng thống kê",
        icon: (props) => <PieChart2 {...props}/>,
        iconSize: 31,
      },
      {
        key: "customers",
        label: "Khách hàng",
        icon: (props) => <UsersGroupTwoRounded {...props}/>,
        iconSize: 32,
      },
      {
        key: "products",
        label: "Sản phẩm",
        icon: (props) => <Box {...props}/>,
        iconSize: 36,
      },
      {
        key: "trucks",
        label: "Xe chở hàng",
        icon: (props) => <Bus {...props}/>,
        iconSize: 32,
      },
      {
        key: "orders",
        label: "Đơn hàng",
        icon: (props) => <BillList {...props}/>,
        iconSize: 31,
      },
      {
        key: "deliveries",
        label: "Giao hàng",
        icon: (props) => <Delivery {...props}/>,
        iconSize: 31,
      },
      {
        key: "analytics",
        label: "Báo cáo",
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
        label: "Người dùng",
        icon: (props) => <User {...props}/>,
        iconSize: 31,
      },
      {
        key: "roles",
        label: "Phân quyền",
        icon: (props) => <ShieldUser {...props}/>,
        iconSize: 31,
      },
    ],
  },
];