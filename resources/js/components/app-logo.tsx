import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20">
                <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="grid flex-1 text-left">
                <span className="truncate text-xs font-black text-slate-900 tracking-tight uppercase leading-tight">
                    Gestión <span className="text-emerald-600">de Contratos</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">
                    {name || 'Sistema Institucional'}
                </span>
            </div>
        </div>
    );
}

