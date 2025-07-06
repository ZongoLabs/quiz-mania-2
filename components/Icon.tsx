
import React from 'react';
import { icons, LucideProps } from 'lucide-react';
import type { IconName } from '../types';

interface IconProps extends LucideProps {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Fallback icon or null
    return null;
  }

  return <LucideIcon {...props} />;
};

export default Icon;
