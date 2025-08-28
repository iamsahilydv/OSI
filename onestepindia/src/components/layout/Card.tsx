import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CustomCardProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const CustomCard = ({
  className,
  title,
  description,
  icon: Icon,
  href,
  footer,
  children,
}: CustomCardProps) => {
  const CardComponent = href ? Link : "div";
  const cardProps = href ? { href } : {};

  return (
    <CardComponent
      {...cardProps}
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md",
        href && "cursor-pointer hover:-translate-y-1",
        className
      )}
    >
      <Card className="h-full">
        {(title || description || Icon) && (
          <CardHeader>
            {Icon && <Icon className="h-6 w-6 text-primary mb-2" />}
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </CardComponent>
  );
};

export default CustomCard;
