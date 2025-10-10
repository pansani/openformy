import { Head, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { type BreadcrumbItem } from "@/types";
import { SharedProps } from "@/types/global";
import AppearanceToggleTab from "@/components/AppearanceTabs";
import HeadingSmall from "@/components/HeadingSmall";
import AppLayout from "@/Layouts/AppLayout";
import SettingsLayout from "@/Layouts/Settings/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaletteIcon, Loader2Icon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Appearance settings",
    href: "/settings/appearance",
  },
];

export default function Appearance() {
  const { auth } = usePage<SharedProps>().props;
  const user = auth?.user;
  const [websiteUrl, setWebsiteUrl] = useState(user?.website_url || "");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractColors = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);

    router.post(
      "/profile/extract-brand-colors",
      { website_url: websiteUrl },
      {
        forceFormData: true,
        preserveScroll: true,
        onFinish: () => {
          setIsExtracting(false);
        },
      }
    );
  };

  const statusLabels = {
    pending: "Pending",
    processing: "Processing...",
    completed: "Completed",
    failed: "Failed",
  };

  const statusColors = {
    pending: "text-yellow-600",
    processing: "text-blue-600",
    completed: "text-green-600",
    failed: "text-red-600",
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Appearance settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance settings"
            description="Update your account's appearance settings"
          />
          <AppearanceToggleTab />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PaletteIcon className="size-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Automatically extract brand colors from your website to customize your forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleExtractColors} className="space-y-4">
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" disabled={isExtracting || !websiteUrl}>
                  {isExtracting ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    "Extract Brand Colors"
                  )}
                </Button>
              </form>

              {user?.brand_colors_status && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Status:{" "}
                    <span className={statusColors[user.brand_colors_status]}>
                      {statusLabels[user.brand_colors_status]}
                    </span>
                  </p>

                  {user.brand_colors_status === "completed" && (
                    <div className="mt-4 flex gap-3">
                      {user.brand_button_color && (
                        <div className="flex flex-col gap-2">
                          <div
                            className="size-16 rounded border"
                            style={{ backgroundColor: user.brand_button_color }}
                          />
                          <p className="text-xs text-center font-medium">Button</p>
                          <p className="text-xs text-center text-muted-foreground">{user.brand_button_color}</p>
                        </div>
                      )}
                      {user.brand_background_color && (
                        <div className="flex flex-col gap-2">
                          <div
                            className="size-16 rounded border"
                            style={{ backgroundColor: user.brand_background_color }}
                          />
                          <p className="text-xs text-center font-medium">Background</p>
                          <p className="text-xs text-center text-muted-foreground">{user.brand_background_color}</p>
                        </div>
                      )}
                      {user.brand_text_color && (
                        <div className="flex flex-col gap-2">
                          <div
                            className="size-16 rounded border"
                            style={{ backgroundColor: user.brand_text_color }}
                          />
                          <p className="text-xs text-center font-medium">Text</p>
                          <p className="text-xs text-center text-muted-foreground">{user.brand_text_color}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
