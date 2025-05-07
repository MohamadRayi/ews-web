
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "normal" | "warning" | "danger" | "offline";
  pulseAnimation?: boolean;
}

const StatusIndicator = ({ status, pulseAnimation = true }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "bg-ews-green";
      case "warning":
        return "bg-ews-yellow";
      case "danger":
        return "bg-ews-red";
      case "offline":
      default:
        return "bg-ews-gray";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "normal":
        return "Normal";
      case "warning":
        return "Waspada";
      case "danger":
        return "Bahaya";
      case "offline":
      default:
        return "Offline";
    }
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "w-3 h-3 rounded-full mr-2",
          getStatusColor(),
          pulseAnimation && "animate-pulse-slow"
        )}
      ></div>
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
};

export default StatusIndicator;
