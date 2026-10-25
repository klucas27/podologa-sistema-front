import { expect, test, type Page } from '@playwright/test';

const TOKEN = 'T'.repeat(43);
const PAGE = `/agendamento/nalu-nails/${TOKEN}`;

const info = {
  status: 'ok',
  data: {
    businessName: 'Nálu Nails', address: 'Rua das Unhas, 10', phoneDisplay: '(12) 99999-0000',
    consentText: '', consentVersion: '1', services: [], professionals: [],
  },
};

const managed = (over: Record<string, unknown> = {}) => ({
  serviceName: 'Manicure',
  professionalId: '22222222-2222-2222-2222-222222222222',
  professionalFirstName: 'Ana',
  start: '2026-11-10T10:00',
  end: '2026-11-10T10:30',
  status: 'scheduled',
  canChange: true,
  changeDeadline: '2026-11-10T04:00',
  ...over,
});

const json = (data: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(data) });

async function mockManage(page: Page, initial: Record<string, unknown>) {
  await page.route('**/api/public/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === 'GET' && url.endsWith('/info')) return route.fulfill(json(info));
    if (method === 'GET' && url.includes('/availability')) {
      const from = new URL(url).searchParams.get('from') ?? '2026-11-12';
      return route.fulfill(json({ status: 'ok', data: { days: [{ date: from, slots: ['14:00', '15:00'] }] } }));
    }
    if (method === 'POST' && url.endsWith('/cancel')) return route.fulfill(json({ status: 'ok', data: { status: 'cancelled' } }));
    if (method === 'POST' && url.endsWith('/reschedule')) {
      const body = route.request().postDataJSON() as { start: string };
      return route.fulfill(json({ status: 'ok', data: managed({ start: body.start, end: `${body.start.slice(0, 11)}14:30` }) }));
    }
    if (method === 'GET' && url.endsWith(`/manage/${TOKEN}`)) return route.fulfill(json({ status: 'ok', data: managed(initial) }));
    return route.fulfill(json({}, 404));
  });
}

test('cliente cancela dentro do prazo', async ({ page }) => {
  await mockManage(page, {});
  page.on('dialog', (dialog) => void dialog.accept());
  await page.goto(PAGE);
  await expect(page.getByText(/Você pode cancelar ou remarcar até/)).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar horário' }).click();
  await expect(page.getByRole('alert')).toHaveText('Seu horário foi cancelado.');
  await expect(page.getByRole('link', { name: 'Agendar novo horário' })).toBeVisible();
});

test('prazo encerrado mostra o telefone do salão', async ({ page }) => {
  await mockManage(page, { canChange: false });
  await page.goto(PAGE);
  await expect(page.getByText(/O prazo para alterar pelo link terminou/)).toContainText('(12) 99999-0000');
  await expect(page.getByRole('button', { name: 'Remarcar' })).toHaveCount(0);
});

test('cliente remarca para outro dia', async ({ page }) => {
  await mockManage(page, {});
  await page.goto(PAGE);
  await page.getByRole('button', { name: 'Remarcar' }).click();
  const day = page.getByRole('button', { name: /\d+\s+de\s+/i });
  await day.first().click();
  await page.getByRole('button', { name: '14:00' }).click();
  await expect(page.getByRole('alert')).toContainText('Horário remarcado');
  await expect(page.getByText('14:00 – 14:30')).toBeVisible();
});
