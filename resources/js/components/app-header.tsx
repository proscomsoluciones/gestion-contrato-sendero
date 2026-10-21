import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Briefcase, CircleDollarSign, FileText, LayoutGrid, Menu, Receipt, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import contracts from '@/routes/contracts';
import installments from '@/routes/installments';
import payments from '@/routes/payments';
import reports from '@/routes/reports';
import sellers from '@/routes/sellers';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems = [
    {
        title: 'Panel Principal',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
    },
    {
        title: 'Contratos',
        href: '/contracts',
        icon: FileText,
    },
    {
        title: 'Pagos & Caja',
        href: '/payments',
        icon: CircleDollarSign,
    },
    {
        title: 'Cuotas',
        href: '/installments',
        icon: Receipt,
    },
    {
        title: 'Vendedores',
        href: '/sellers',
        icon: Briefcase,
    },
    {
        title: 'Reportes & Libros',
        href: '/reports',
        icon: BarChart3,
    },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
            <div className="mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
                
                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center">
                        <AppLogo />
                    </Link>
                </div>

                {/* Center: Horizontal Nav Bar (Catemu Style) */}
                <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                    {mainNavItems.map((item) => {
                        const isActive = page.url === item.href || page.url.startsWith(item.href + '?') || (item.href !== '/dashboard' && page.url.startsWith(item.href));
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                                )}
                            >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>


                {/* Right: User Avatar Dropdown */}
                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 bg-white p-6">
                                <SheetTitle className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Menú de Navegación</SheetTitle>
                                <div className="flex flex-col space-y-2">
                                    {mainNavItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                                        >
                                            {item.icon && <item.icon className="h-4 w-4 text-emerald-600" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs">
                                <Avatar className="h-7 w-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
                                    <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                    <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-xs">
                                        {getInitials(auth.user?.name ?? 'Admin')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block text-left leading-tight">
                                    <div className="text-[11px] font-black text-slate-900 leading-none">{auth.user?.name || 'Super Admin'}</div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">Gestión Institucional</div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            {auth.user && <UserMenuContent user={auth.user} />}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

            </div>
        </header>
    );
}


