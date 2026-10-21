import { Link } from '@inertiajs/react';
import { BarChart3, Briefcase, CircleDollarSign, FileText, LayoutGrid, Receipt, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import contracts from '@/routes/contracts';
import installments from '@/routes/installments';
import payments from '@/routes/payments';
import reports from '@/routes/reports';
import sellers from '@/routes/sellers';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Panel Principal',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: clients.index(),
        icon: Users,
    },
    {
        title: 'Contratos',
        href: contracts.index(),
        icon: FileText,
    },
    {
        title: 'Pagos & Caja',
        href: payments.index(),
        icon: CircleDollarSign,
    },
    {
        title: 'Cuotas',
        href: installments.index(),
        icon: Receipt,
    },
    {
        title: 'Vendedores',
        href: sellers.index(),
        icon: Briefcase,
    },
    {
        title: 'Reportes & Libros',
        href: reports.index(),
        icon: BarChart3,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-slate-200/80 bg-white">
            <SidebarHeader className="p-4 border-b border-slate-100">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-100">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 text-center mb-2">
                    Software por Proscom
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

