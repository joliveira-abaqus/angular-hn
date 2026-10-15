import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { makeFeed, makeStory } from './test/fixtures';
import { mockApi, renderWithProviders } from './test/utils';
import { AppRoutes } from './routes';

describe('rotas', () => {
    it('redireciona "/" para /news/1 e registra o pageview no GA', async () => {
        const ga = vi.fn();
        window.ga = ga;
        mockApi({ '/news?page=1': makeFeed(30) });
        renderWithProviders(<AppRoutes />, { route: '/' });
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        expect(ga).not.toHaveBeenCalledWith('set', 'page', '/');
        delete window.ga;
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('/%s/:page busca o feed correspondente', async feed => {
        const fetchMock = mockApi({ [`/${feed}?page=2`]: makeFeed(3, 30) });
        renderWithProviders(<AppRoutes />, { route: `/${feed}/2` });
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(String(fetchMock.mock.calls[0][0])).toContain(`/${feed}?page=2`);
    });

    it('pagina o feed com Prev/More e numera a lista a partir da página', async () => {
        mockApi({ '/news?page=1': makeFeed(30), '/news?page=2': makeFeed(30, 30) });
        const { container } = renderWithProviders(<AppRoutes />, { route: '/news/1' });
        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('link', { name: /More/ }));
        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    });

    it('esconde "More" quando a página tem menos de 30 itens e mostra o aviso de jobs', async () => {
        mockApi({ '/jobs?page=1': makeFeed(5) });
        renderWithProviders(<AppRoutes />, { route: '/jobs/1' });
        await screen.findByText('Story 1');
        expect(screen.queryByRole('link', { name: /More/ })).not.toBeInTheDocument();
        expect(screen.getByText(/funded by Y Combinator/)).toBeInTheDocument();
    });

    it('mostra mensagem de erro quando o feed falha', async () => {
        mockApi({});
        renderWithProviders(<AppRoutes />, { route: '/show/1' });
        expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument();
    });

    it('/item/:id mostra story, comentários e resultado de poll', async () => {
        mockApi({
            '/item/100': makeStory({
                id: 100,
                type: 'poll',
                title: 'Poll: React ou Angular?',
                url: 'item?id=100',
                content: '<p>Vote!</p>',
                poll: [{}, {}] as never,
                comments_count: 1,
                comments: [
                    { id: 5, level: 0, user: 'alice', time: 0, time_ago: 'now', content: '<p>Oi</p>', deleted: false, comments: [] },
                ],
            }),
            '/item/101': { points: 3, content: 'React' },
            '/item/102': { points: 1, content: 'Angular' },
        });
        const { container } = renderWithProviders(<AppRoutes />, { route: '/item/100' });
        expect(await screen.findByText('Vote!')).toBeInTheDocument();
        expect(screen.getByText('Oi')).toBeInTheDocument();
        expect(screen.getByText('3 points')).toBeInTheDocument();
        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('/user/:id mostra o perfil', async () => {
        mockApi({ '/user/pg': { id: 'pg', karma: 155000, created: '19 years ago', about: '<p>Bio</p>' } });
        renderWithProviders(<AppRoutes />, { route: '/user/pg' });
        expect(await screen.findByText('155000 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 19 years ago')).toBeInTheDocument();
        expect(screen.getByText('Bio')).toBeInTheDocument();
    });

    it('mostra erro quando o usuário não é encontrado', async () => {
        mockApi({});
        renderWithProviders(<AppRoutes />, { route: '/user/ninguem' });
        expect(await screen.findByText('Could not load user ninguem.')).toBeInTheDocument();
    });

    it('troca o tema pelo painel de settings', async () => {
        mockApi({ '/news?page=1': makeFeed(1) });
        const { container } = renderWithProviders(<AppRoutes />, { route: '/news/1' });
        await screen.findByText('Story 1');
        expect(container.firstElementChild).toHaveClass('default');

        await userEvent.click(screen.getByAltText('Settings'));
        const dialog = screen.getByRole('dialog', { name: 'Settings' });
        await userEvent.click(within(dialog).getByLabelText(/Night/));
        await waitFor(() => expect(container.firstElementChild).toHaveClass('night'));
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(within(dialog).getByLabelText('Close settings'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
