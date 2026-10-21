import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between relative overflow-x-hidden">
            {/* Background Ambient Glow Mesh */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-600/15 blur-3xl pointer-events-none -z-10" />

            {/* Top Bar Minimal Header */}
            <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
                <Link href={home()} className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform duration-200">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 tracking-tight uppercase block">Gestión <span className="text-emerald-600">de Contratos</span></span>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sistema Institucional</div>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        PORTAL SEGURO SSL 256-BIT
                    </span>
                </div>
            </header>

            {/* Main Login Container */}
            <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
                <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 relative transition-all duration-300">
                    
                    {/* Header Inside Card */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex h-14 w-14 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 shadow-xl shadow-emerald-500/25 items-center justify-center text-white mb-1">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title || 'Acceso Ejecutivo'}</h1>
                        {description && (
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">{description}</p>
                        )}
                    </div>

                    {children}

                    {/* Audit Footer inside Card */}
                    <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-semibold space-y-1">
                        <div>Plataforma de Auditoría & Control Institucional</div>
                        <div className="text-slate-400">IP Registrada • Servidor Auditado</div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-[11px] text-slate-400 font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
                <div>© 2026 Gestión Ejecutiva de Contratos — Software diseñado por Proscom.</div>
                <div className="flex items-center gap-4">
                    <span className="hover:text-slate-600 transition cursor-pointer">Políticas de Privacidad</span>
                    <span>•</span>
                    <span className="hover:text-slate-600 transition cursor-pointer">Términos de Servicio</span>
                    <span>•</span>
                    <span className="hover:text-slate-600 transition cursor-pointer">Soporte TI</span>
                </div>
            </footer>
        </div>
    );
}



