import { expect, test, type Page } from '@playwright/test';

const info = {
  status: 'ok',
  data: {
    businessName: 'Nálu Nails',
    address: 'Rua das Unhas, 10',
    phoneDisplay: null,
    consentText: 'Autorizo o uso dos meus dados para o agendamento.',
    consentVersion: '1',
    services: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Manicure', category: 'estetica', durationMinutes: 60, price: 35 }],
    professionals: [{ id: '22222222-2222-2222-2222-222222222222', firstName: 'Ana', serviceIds: ['11111111-1111-1111-1111-111111111111'] }],
  },
};

async function mockPublic(page: Page, bookStatus: 201 | 409) {
  await page.route('**/api/public/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === 'GET' && url.includes('/info')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(info) });
      return;
    }
    if (method === 'POST' && url.includes('/identify')) {
      const body = route.request().postDataJSON() as { phone: string };
      const registered = body.phone === '12988036103';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', data: registered ? { registered: true, firstName: 'Maria' } : { registered: false } }),
      });
      return;
    }
    if (method === 'POST' && url.includes('/register')) {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ status: 'ok', data: { firstName: 'Joana' } }) });
      return;
    }
    if (method === 'GET' && url.includes('/availability')) {
      const from = new URL(url).searchParams.get('from') ?? '2026-11-02';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok', data: { days: [{ date: from, slots: ['10:00', '11:00'] }] } }),
      });
      return;
    }
    if (method === 'POST' && url.includes('/bookings')) {
      if (bookStatus === 409) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'error', message: 'Esse horário acabou de ser ocupado. Escolha outro.' }),
        });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          data: {
            bookingId: 'b1',
            status: 'pending',
            serviceName: 'Manicure',
            professionalFirstName: 'Ana',
            start: '2026-11-02T10:00',
            end: '2026-11-02T11:00',
            address: 'Rua das Unhas, 10',
            manageToken: 'codigo-teste',
          },
        }),
      });
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
}

async function pickFirstDay(page: Page) {
  const day = page.getByRole('button', { name: /\d+\s+de\s+/i });
  await expect(day.first()).toBeVisible();
  await day.first().click();
}

test('cliente cadastrada reserva e recebe o link individual', async ({ page }) => {
  await mockPublic(page, 201);
  await page.goto('/agendar/nalu-nails');
  await page.getByLabel('Celular').fill('12988036103');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Maria!' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /Manicure/ }).click();
  await page.getByRole('button', { name: 'Ana' }).click();
  await pickFirstDay(page);
  await page.getByRole('button', { name: '10:00' }).click();
  await expect(page.getByText('Aguardando confirmação do salão')).toBeVisible();
  await expect(page.getByRole('link', { name: /\/agendamento\/nalu-nails\/codigo-teste$/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Salvar no WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/);
});

test('cliente nova passa pelo cadastro e reserva', async ({ page }) => {
  await mockPublic(page, 201);
  await page.goto('/agendar/nalu-nails');
  await page.getByLabel('Celular').fill('11988887777');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Nome completo').fill('Joana Prado');
  await page.getByRole('checkbox', { name: /Autorizo o uso dos meus dados/ }).check();
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Joana!' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /Manicure/ }).click();
  await page.getByRole('button', { name: 'Sem preferência' }).click();
  await pickFirstDay(page);
  await page.getByRole('button', { name: '10:00' }).click();
  await expect(page.getByRole('link', { name: /codigo-teste$/ })).toBeVisible();
});

test('409 volta para os horários com aviso', async ({ page }) => {
  await mockPublic(page, 409);
  await page.goto('/agendar/nalu-nails');
  await page.getByLabel('Celular').fill('12988036103');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /Manicure/ }).click();
  await page.getByRole('button', { name: 'Ana' }).click();
  await pickFirstDay(page);
  await page.getByRole('button', { name: '10:00' }).click();
  await expect(page.getByRole('alert')).toHaveText('Esse horário acabou de ser ocupado. Escolha outro.');
  await expect(page.getByRole('heading', { name: 'Horário' })).toBeVisible();
  await expect(page.getByRole('button', { name: '11:00' })).toBeVisible();
});
