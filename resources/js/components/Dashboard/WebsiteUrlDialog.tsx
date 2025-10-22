import { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { SharedProps } from "@/types/global";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function WebsiteUrlDialog() {
  const { auth } = usePage<SharedProps>().props;
  const user = auth?.user;
  const [showDialog, setShowDialog] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !user.website) {
      setShowDialog(true);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.post(
      "/profile/extract-brand-colors",
      { website_url: websiteUrl },
      {
        forceFormData: true,
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setIsSubmitting(false);
          setShowDialog(false);
        },
      },
    );
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your brand colors</DialogTitle>
          <DialogDescription>
            Enter your website URL to automatically extract your brand colors
            and customize your forms.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={isSubmitting || !websiteUrl}>
              {isSubmitting ? "Extracting..." : "Extract Colors"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
