import { type BreadcrumbItem, type SharedData } from "@/types";
import { Transition } from "@headlessui/react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteUser from "@/components/DeleteUser";
import SettingsLayout from "@/Layouts/Settings/Layout";
import HeadingSmall from "@/components/HeadingSmall";
import InputError from "@/components/InputError";
import AppLayout from "@/Layouts/AppLayout";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Profile settings",
    href: "/settings/profile",
  },
];

type ProfileForm = {
  name: string;
  email: string;
  language: string;
  logo?: File;
};

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const { auth } = usePage<SharedData>().props;

  const { data, setData, post, errors, processing, recentlySuccessful } =
    useForm<ProfileForm>({
      name: auth.user.name,
      email: auth.user.email,
      language: auth.user.language || "en",
      logo: undefined,
    });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    auth.user.logo || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post("/profile/update", {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Profile information"
            description="Update your name and email address"
          />

          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>

              <Input
                id="name"
                className="mt-1 block w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
                autoComplete="name"
                placeholder="Full name"
              />

              <InputError className="mt-2" message={errors.name} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                required
                autoComplete="username"
                placeholder="Email address"
              />

              <InputError className="mt-2" message={errors.email} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={data.language} onValueChange={(value) => setData("language", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
              <InputError className="mt-2" message={errors.language} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo</Label>
              {logoPreview && (
                <div className="w-full h-24 rounded-lg overflow-hidden border mb-2">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain bg-muted" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {logoPreview ? "Change Logo" : "Upload Logo"}
              </Button>
              <input
                ref={fileInputRef}
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <InputError className="mt-2" message={errors.logo} />
            </div>

            {mustVerifyEmail && auth.user.email_verified_at === null && (
              <div>
                <p className="-mt-4 text-sm text-muted-foreground">
                  Your email address is unverified.{" "}
                  <Link
                    href="/email/verification-notification"
                    method="post"
                    as="button"
                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                  >
                    Click here to resend the verification email.
                  </Link>
                </p>

                {status === "verification-link-sent" && (
                  <div className="mt-2 text-sm font-medium text-green-600">
                    A new verification link has been sent to your email address.
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button disabled={processing}>Save</Button>

              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-neutral-600">Saved</p>
              </Transition>
            </div>
          </form>
        </div>

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  );
}
