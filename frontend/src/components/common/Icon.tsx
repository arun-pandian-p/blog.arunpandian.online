import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: any;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export const AppIcon: React.FC<IconProps> = ({ icon, size = 20, className = '', strokeWidth = 1.5, ...props }) => {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export default AppIcon;

