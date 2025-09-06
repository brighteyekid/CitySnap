import React from 'react';
import { 
  Trash2, 
  Construction, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  FileText,
  LucideIcon
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'Trash2': Trash2,
  'Construction': Construction,
  'Droplets': Droplets,
  'Zap': Zap,
  'AlertTriangle': AlertTriangle,
  'FileText': FileText,
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = "h-4 w-4" }) => {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    return <FileText className={className} />;
  }
  
  return <IconComponent className={className} />;
};

export default CategoryIcon;