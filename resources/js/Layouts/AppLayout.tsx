import { usePage } from "@inertiajs/react";
import AppLayoutTemplate from "@/Layouts/App/AppSidebarLayout";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode, useState, useEffect } from "react";
import { useFlashToasts } from "@/hooks/useFlashToast";
import { SharedProps } from "@/types/global";
import { Toaster } from "sonner";
import { BrandColorDialog } from "@/components/BrandColorDialog";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
  children,
  breadcrumbs,
  ...props
}: AppLayoutProps) {
  const { flash, auth } = usePage<SharedProps>().props;
  const [showBrandDialog, setShowBrandDialog] = useState(false);

  useFlashToasts(flash);

  useEffect(() => {
    const user = auth?.user;
    if (user && !user.website_url && !user.brand_colors_status) {
      const hasSeenDialog = localStorage.getItem('brand_color_dialog_seen');
      if (!hasSeenDialog) {
        setShowBrandDialog(true);
        localStorage.setItem('brand_color_dialog_seen', 'true');
      }
    }
  }, [auth]);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <Toaster richColors position="top-center" />
      <BrandColorDialog open={showBrandDialog} onOpenChange={setShowBrandDialog} />
      <div className="flex flex-col h-full">
        {children}
      </div>
    </AppLayoutTemplate>
  );
}
