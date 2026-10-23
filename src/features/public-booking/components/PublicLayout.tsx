import React from 'react';

interface PublicLayoutProps {
  businessName: string;
  address?: string | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Folha do link, pensada para o celular: nome do salão e ação fixa no rodapé. */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ businessName, address, children, footer }) => (
  <div className="min-h-dvh bg-primary-50 text-gray-800">
    <div className={`mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 ${footer ? 'pb-28' : 'pb-8'}`}>
      <header className="pb-6 pt-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-500">Agendamento</p>
        <h1 className="mt-1 font-display text-3xl leading-tight text-primary-700">{businessName}</h1>
        {address ? <p className="mt-2 text-sm text-gray-600">{address}</p> : null}
      </header>
      <main className="flex-1">{children}</main>
    </div>
    {footer ? (
      <div className="fixed inset-x-0 bottom-0 border-t border-primary-100 bg-primary-50/95 px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto w-full max-w-md pb-3">{footer}</div>
      </div>
    ) : null}
  </div>
);

export const PublicPrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <button
    type="submit"
    className={`min-h-11 w-full rounded-lg bg-primary-500 px-4 text-base font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    {...rest}
  >
    {children}
  </button>
);
