import React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const PageWrapper = ({
  children,
  className,
  title,
  description,
}: PageWrapperProps) => {
  return (
    <div className={cn("container-custom py-6", className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageWrapper;
