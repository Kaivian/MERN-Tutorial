import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const HomeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12.204c0-2.289 0-3.433.52-4.381c.518-.949 1.467-1.537 3.364-2.715l2-1.241C9.889 2.622 10.892 2 12 2s2.11.622 4.116 1.867l2 1.241c1.897 1.178 2.846 1.766 3.365 2.715S22 9.915 22 12.203v1.522c0 3.9 0 5.851-1.172 7.063S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.212S2 17.626 2 13.725z"></path>
    <path d="M12 15v3"></path>
  </svg>
);

const IconMap = {
  Home: HomeIcon,
};

export type InternalIconName = keyof typeof IconMap;

// SỬ DỤNG OMIT Ở ĐÂY
// Ý nghĩa: Lấy tất cả props của IconProps TRỪ prop "name", sau đó định nghĩa lại "name" mới
interface IconSwitchProps extends Omit<IconProps, 'name'> {
  name: InternalIconName | React.ElementType;
}

const IconSwitch: React.FC<IconSwitchProps> = ({ name, ...props }) => {
  if (typeof name !== 'string') {
    const IconComponent = name;
    return <IconComponent {...props} />;
  }

  const IconComponent = IconMap[name as InternalIconName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in IconMap.`);
    return null;
  }

  return <IconComponent {...props} />;
};

export default IconSwitch;