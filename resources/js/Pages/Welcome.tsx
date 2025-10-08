import { Link } from "@inertiajs/react";
import PublicLayout from "@/Layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Github, Download, Zap, Lock, Code } from "lucide-react";

export default function Welcome() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Open Source Form Builder
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Build Beautiful Forms
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Own Your Data
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Self-hosted, open source form builder. Create conversational
              forms, collect responses, and keep full control of your data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/user/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <a
                href="https://github.com/pansani/openformy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <Github className="h-5 w-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-3xl -z-10" />
              <Link href="/demo/contact-us" className="block group">
                <div className="bg-card border rounded-xl shadow-2xl overflow-hidden transition-all group-hover:shadow-3xl group-hover:scale-[1.01]">
                  <div className="bg-muted border-b px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground ml-4">
                      demo/contact-us
                    </div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                    <div className="text-left w-full">
                      <div className="text-sm text-muted-foreground mb-2">
                        1 / 3
                      </div>
                      <h2 className="text-3xl font-bold mb-4">
                        What's your best email?
                      </h2>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-lg border bg-background"
                        disabled
                      />
                      <div className="mt-6 flex justify-end">
                        <Button>Next</Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 border-t px-6 py-3 text-sm text-center text-muted-foreground">
                    Click to try the interactive demo →
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="py-20 border-t">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose OpenFormy?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create, share, and analyze forms without
                compromising on privacy or control.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Self-Hosted</h3>
                <p className="text-muted-foreground">
                  Host on your own infrastructure. Your data never leaves your
                  servers. Full control and privacy.
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Open Source</h3>
                <p className="text-muted-foreground">
                  MIT licensed. Inspect the code, contribute features, or fork
                  for your needs. Complete transparency.
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Limits</h3>
                <p className="text-muted-foreground">
                  Unlimited forms, unlimited responses, unlimited everything. No
                  pricing tiers or feature gates.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-blue-600/5 rounded-2xl p-8 md:p-12 border">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Conversational Forms
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Create engaging, one-question-at-a-time forms that feel like
                    a conversation. Better completion rates and happier users.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Multiple question types (text, email, phone, date,
                        dropdowns)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Real-time validation and error handling</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Mobile-optimized and fully responsive</span>
                    </li>
                  </ul>
                </div>
                <div className="order-first md:order-last">
                  <div className="bg-card border rounded-lg shadow-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="text-sm font-medium">
                          Progress Indicator
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-background">
                        <div className="text-xs text-muted-foreground mb-2">
                          Question 2 of 5
                        </div>
                        <div className="font-semibold mb-2">
                          What's your name?
                        </div>
                        <div className="h-10 border rounded bg-muted" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">
                          Back
                        </Button>
                        <Button size="sm">Next</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-20 border-t">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Deploy Anywhere
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                OpenFormy works wherever you need it. Deploy with Docker, on your
                VPS, or use our cloud version.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="p-6 rounded-lg border bg-card">
                <Download className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Self-Hosted</h3>
                <p className="text-muted-foreground mb-4">
                  Run on your own servers. Full control, zero monthly fees.
                </p>
                <code className="text-xs bg-muted px-3 py-2 rounded block">
                  docker run -p 8000:8000 openformy
                </code>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <Github className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Open Source</h3>
                <p className="text-muted-foreground mb-4">
                  Clone, modify, and deploy. MIT licensed for maximum freedom.
                </p>
                <code className="text-xs bg-muted px-3 py-2 rounded block">
                  git clone github.com/pansani/openformy
                </code>
              </div>
            </div>
          </div>

          <div className="py-20 border-t text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Create your first form in minutes. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/user/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/demo/contact-us">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Try Demo Form
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
