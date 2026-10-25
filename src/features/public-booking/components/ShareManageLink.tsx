import React, { useRef, useState } from 'react';
import { whatsappShareUrl } from '../services/publicBooking.service';

interface ShareManageLinkProps {
  url: string;
}

/** Link individual da cliente com "Copiar link" e "Salvar no WhatsApp" (wa.me, sem número). */
export const ShareManageLink: React.FC<ShareManageLinkProps> = ({ url }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Sem Clipboard API (ex.: navegador interno do app): seleciona para a cliente copiar
      inputRef.current?.select();
      setCopied(document.execCommand?.('copy') ?? false);
    }
  };

  return (
    <div className="space-y-2">
      <a href={url} className="block break-all text-base font-medium text-primary-700 underline">
        {url}
      </a>
      <input ref={inputRef} readOnly value={url} aria-label="Link do seu horário" className="sr-only" />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void copy()}
          className="min-h-11 rounded-lg border border-primary-200 bg-white px-3 text-base font-medium text-primary-700"
        >
          {copied ? 'Link copiado' : 'Copiar link'}
        </button>
        <a
          href={whatsappShareUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center rounded-lg bg-primary-500 px-3 text-base font-medium text-white"
        >
          Salvar no WhatsApp
        </a>
      </div>
    </div>
  );
};
