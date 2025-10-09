import { useState } from "react"
import { router } from "@inertiajs/react"
import { PaletteIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BrandColorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandColorDialog({ open, onOpenChange }: BrandColorDialogProps) {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    router.post(
      "/profile/extract-brand-colors",
      { website_url: websiteUrl },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          onOpenChange(false)
          setWebsiteUrl("")
        },
        onFinish: () => {
          setIsSubmitting(false)
        },
      }
    )
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PaletteIcon className="size-5" />
              Extract Brand Colors
            </DialogTitle>
            <DialogDescription>
              Enter your website URL and we'll automatically extract your brand colors
              to customize your forms.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
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
  )
}
