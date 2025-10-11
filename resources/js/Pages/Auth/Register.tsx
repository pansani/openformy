import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle, Upload } from "lucide-react";
import { FormEventHandler, useRef, useState } from "react";
import { RegisterFormData } from "@/schemas/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/InputError";
import TextLink from "@/components/TextLink";
import AuthLayout from "@/Layouts/AuthLayout";


export default function Register() {
  const { data, setData, post, processing, errors } = useForm<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    logo: undefined,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
    post("/user/register", {
      forceFormData: true,
    });
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Crafting seamless digital experiences with InertiaJS, React, and Golang"
      logo="OpenFormy"
    >
      <Head title="Register" />

      <form className="flex flex-col gap-6 w-full max-w-md" onSubmit={submit}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoFocus
              autoComplete="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Your name"
            />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="email@example.com"
            />
            <InputError message={errors.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Password"
            />
            <InputError message={errors.password} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password-confirm">Confirm Password</Label>
            <Input
              id="password-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              placeholder="Confirm your password"
            />
            <InputError message={errors["password_confirmation"]} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo">Logo (optional)</Label>
            {logoPreview && (
              <div className="w-full h-24 rounded-lg overflow-hidden border mb-2">
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-muted" />
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
            <InputError message={errors.logo} />
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <TextLink href="/user/login" tabIndex={6}>
            Log in
          </TextLink>
        </div>
      </form>
    </AuthLayout>
  );
}
