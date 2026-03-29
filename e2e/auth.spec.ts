import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API para auth/me retornar 401 (não autenticado)
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) }),
    );
  });

  test('exibe formulário de login', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel('Usuário')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('login com credenciais válidas redireciona para /dashboard', async ({ page }) => {
    // Mock login e session
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: '1',
              username: 'admin',
              professionalName: null,
              role: 'admin',
              professionalId: null,
              workdayStart: '08:00',
              workdayEnd: '18:00',
            },
            csrfToken: 'test-csrf',
          },
        }),
      }),
    );

    // Mock dashboard data
    await page.route('**/api/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { metrics: {}, todayAppointments: [], chartData: [] } }),
      }),
    );

    await page.goto('/login');

    await page.getByLabel('Usuário').fill('admin');
    await page.getByLabel('Senha').fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    // Mock login failure
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      }),
    );

    // Mock refresh failure for interceptor
    await page.route('**/api/auth/refresh', (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({}) }),
    );

    await page.goto('/login');

    await page.getByLabel('Usuário').fill('admin');
    await page.getByLabel('Senha').fill('senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Credenciais inválidas')).toBeVisible();
  });

  test('validação do formulário impede submit com campos inválidos', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Usuário').fill('ab');
    await page.getByLabel('Senha').fill('12345');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Usuário deve ter pelo menos 3 caracteres')).toBeVisible();
    await expect(page.getByText('Senha deve ter pelo menos 6 caracteres')).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('redireciona para /login quando não autenticado', async ({ page }) => {
    // Mock auth/me 401
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) }),
    );

    // Mock refresh failure
    await page.route('**/api/auth/refresh', (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({}) }),
    );

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });
});
