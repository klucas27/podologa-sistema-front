/** Espelho de podologa-sistema-back/src/shared/utils/phone.ts — manter as duas iguais. */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);

  if (!/^[1-9][1-9]\d{8,9}$/.test(digits)) return null;
  if (digits.length === 11 && digits[2] !== '9') return null;
  return digits;
}

/** Máscara progressiva enquanto digita: (12) 98803-6103. */
export function maskPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const split = rest.length > 8 ? 5 : 4;
  return rest.length <= split ? `(${ddd}) ${rest}` : `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
