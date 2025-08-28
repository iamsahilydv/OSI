import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  text?: string;
}

const Loader = ({
  className,
  size = "md",
  fullPage = false,
  text,
}: LoaderProps) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const loader = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2
        className={cn("animate-spin text-primary", sizeMap[size])}
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
