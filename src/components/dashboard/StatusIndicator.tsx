import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/database.types";

type SensorStatus = Database['public']['Enums']['sensor_status'];

interface StatusIndicatorProps {
  status: SensorStatus;
  pulseAnimation?: boolean;
}

const StatusIndicator = ({ status, pulseAnimation = true }: StatusIndicatorProps) => {
  const getStatusConfig = (status: SensorStatus) => {
    switch (status) {
      case 'normal':
        return {
          color: 'bg-green-500',
          text: 'Normal',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          text: 'Waspada',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50'
        };
      case 'siaga':
        return {
          color: 'bg-orange-500',
          text: 'Siaga',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50'
        };
      case 'danger':
        return {
          color: 'bg-red-500',
          text: 'Bahaya',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-2 px-2 py-0.5 rounded-full",
        config.bgColor,
        config.textColor
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          config.color,
          pulseAnimation && "animate-pulse"
        )}
      />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
};

export default StatusIndicator;
