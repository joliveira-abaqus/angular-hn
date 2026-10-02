import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { makeComment, makeStory, sampleUser } from './test/fixtures';
import { mockApi, renderApp } from './test/utils';

const fullPage = Array.from({ length: 30 }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}` }));

describe('App', () => {
    it('redireciona / para /news/1 e aplica a classe do tema no wrapper raiz', async () => {
        mockApi({ '/news?page=1': fullPage });
        const { router, container } = renderApp('/');
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/news/1');
        expect(container.firstElementChild).toHaveClass('default');
    });

    it('envia pageviews ao Google Analytics na navegação', async () => {
        const ga = vi.fn();
        window.ga = ga;
        mockApi({ '/news?page=1': fullPage, '/news?page=2': [makeStory({ id: 99, title: 'Page two' })] });
        renderApp('/news/1');
        await userEvent.click(await screen.findByText('More ›'));
        await screen.findByText('Page two');
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
        expect(ga).toHaveBeenCalledWith('set', 'page', '/news/2');
        expect(ga).toHaveBeenCalledWith('send', 'pageview');
        delete window.ga;
    });

    it('pagina o feed com links Prev/More', async () => {
        mockApi({ '/newest?page=2': fullPage });
        const { container } = renderApp('/newest/2');
        await screen.findByText('Story 1');
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByText('‹ Prev')).toHaveAttribute('href', '/newest/1');
        expect(screen.getByText('More ›')).toHaveAttribute('href', '/newest/3');
    });

    it('omite More na última página e mostra o cabeçalho de jobs', async () => {
        mockApi({ '/jobs?page=1': [makeStory({ type: 'job', points: null, user: null, title: 'Hiring' })] });
        renderApp('/jobs/1');
        await screen.findByText('Hiring');
        expect(screen.getByText(/jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.queryByText('More ›')).not.toBeInTheDocument();
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
    });

    it('mostra erro quando o feed falha', async () => {
        mockApi({});
        renderApp('/ask/1');
        expect(await screen.findByText(/Could not load ask stories/)).toBeInTheDocument();
    });

    it('renderiza links internos para itens sem URL externa', async () => {
        mockApi({ '/show?page=1': [makeStory({ id: 7, url: 'item?id=7', title: 'Show HN: thing' })] });
        renderApp('/show/1');
        expect(await screen.findByText('Show HN: thing')).toHaveAttribute('href', '/item/7');
    });

    it('abre links em nova aba conforme as configurações e persiste o tema', async () => {
        mockApi({ '/news?page=1': fullPage });
        const { container } = renderApp('/news/1');
        const link = await screen.findByText('Story 1');
        expect(link).not.toHaveAttribute('target');

        await userEvent.click(screen.getByAltText('Settings'));
        const dialog = screen.getByText('Settings', { selector: 'h1' }).closest('.popup') as HTMLElement;
        await userEvent.click(within(dialog).getByLabelText(/Open links in a new tab/));
        await userEvent.click(within(dialog).getByLabelText(/Night/));

        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
        expect(container.firstElementChild).toHaveClass('night');
        expect(localStorage.getItem('theme')).toBe('night');

        await userEvent.click(within(dialog).getByText('×'));
        expect(screen.queryByText('Settings', { selector: 'h1' })).not.toBeInTheDocument();
    });

    it('renderiza detalhes do item com comentários recursivos', async () => {
        const item = makeStory({
            id: 5,
            title: 'Item with comments',
            content: '<p>Body</p>',
            comments: [
                makeComment({
                    id: 101,
                    comments: [
                        makeComment({
                            id: 102,
                            user: 'bob',
                            content: '<p>Nested reply</p>',
                            comments: [makeComment({ id: 103, user: 'carol', content: '<p>Deep reply</p>' })],
                        }),
                    ],
                }),
                makeComment({ id: 104, deleted: true }),
            ],
        });
        mockApi({ '/item/5': item });
        renderApp('/item/5');

        expect((await screen.findAllByText('Item with comments')).length).toBeGreaterThan(0);
        expect(screen.getByText('Top level')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
        expect(screen.getByText('Deep reply')).toBeInTheDocument();
        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.getByText('carol')).toHaveAttribute('href', '/user/carol');

        const [collapseToggle] = screen.getAllByText('[-]');
        await userEvent.click(collapseToggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).not.toBeVisible();
    });

    it('renderiza o perfil do usuário', async () => {
        mockApi({ '/user/pg': sampleUser });
        renderApp('/user/pg');
        expect(await screen.findByText('157000 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 19 years ago')).toBeInTheDocument();
        expect(screen.getByText('Bug fixer.')).toHaveAttribute('href', 'https://paulgraham.com');
    });

    it('mostra erro quando o usuário não carrega', async () => {
        mockApi({});
        renderApp('/user/nobody');
        await waitFor(() => expect(screen.getByText(/Could not load user nobody/)).toBeInTheDocument());
    });
});
