import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { StatusType } from './status-types';
import { cn } from '@/lib/utils';

interface StatusIconProps {
  type: StatusType;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({ type, className }) => {
  const baseClass = 'h-4 w-4';

  switch (type) {
    case 'error':
      return <AlertCircle className={cn(baseClass, 'text-destructive', className)} />;
    case 'warning':
      return <AlertTriangle className={cn(baseClass, 'text-amber-500', className)} />;
    case 'info':
      return <Info className={cn(baseClass, 'text-blue-500', className)} />;
    case 'success':
      return <CheckCircle className={cn(baseClass, 'text-green-500', className)} />;
    default:
      return <Info className={cn(baseClass, 'text-blue-500', className)} />;
  }
};

export default StatusIcon;
