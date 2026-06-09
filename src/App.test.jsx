import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('PageU app shell', () => {
  it('renders the landing page with the required core content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('PageU')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '生成你的个人网站' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '立即创建' })).toHaveAttribute('href', '/create');
    expect(screen.getByText('小U')).toBeInTheDocument();
    expect(screen.getByText('准备好开始了吗？')).toBeInTheDocument();
  });

  it('navigates to the create placeholder from the landing CTA', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('link', { name: '立即创建' }));

    expect(screen.getByRole('heading', { name: '创建页' })).toBeInTheDocument();
    expect(screen.getByText('告诉我你的经历')).toBeInTheDocument();
  });

  it.each([
    ['/analyze', 'AI 分析页', '这是我对你的理解'],
    ['/editor', '编辑页', '再调整一下，让它更像你'],
    ['/publish', '发布页', '你的个人网站准备好了'],
    ['/site/demo', '个人网站页', '这里是生成后的个人网站'],
  ])('renders the placeholder route %s', (path, title, hint) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
  });
});
