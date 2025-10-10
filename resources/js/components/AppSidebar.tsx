import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { BookOpen, FileText, Folder, LayoutGrid } from "lucide-react";
import { NavMain } from "./NavMain";
import { NavFooter } from "./NavFooter";
import { NavUser } from "./NavUser";
import { SharedProps } from "@/types/global";

const footerNavItems: NavItem[] = [
  {
    title: "Repository",
    href: "https://github.com/occult/openformy",
    icon: Folder,
  },
  {
    title: "Documentation",
    href: "https://github.com/occult/openformy?tab=readme-ov-file#introduction",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const { auth } = usePage<SharedProps>().props;

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Forms",
      href: "/forms",
      icon: FileText,
    },
    // {
    //   title: "Plans",
    //   href: "/plans",
    //   icon: CreditCard,
    // },
    // {
    //   title: "Products",
    //   href: "/products",
    //   icon: ShoppingBag,
    // },
    // {
    //   title: "Premium",
    //   href: "/premium",
    //   icon: Crown,
    // },
    // {
    //   title: "Upload Files",
    //   href: "/files",
    //   icon: UploadCloud,
    // },
    // {
    //   title: "Billing",
    //   href: "/billing",
    //   icon: Receipt,
    // },
  ];

  if (auth.user?.admin) {
    mainNavItems.push({
      title: "Admin Panel",
      href: "/admin/users",
      icon: LayoutGrid,
    });
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" prefetch>
                <span>OpenFormy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
