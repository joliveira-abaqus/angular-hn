import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { Comment as CommentModel } from '../models/comment';
import { renderWithProviders } from '../test/utils';
import { Comment } from './Comment';

function makeComment(overrides: Partial<CommentModel> = {}): CommentModel {
    return {
        id: 1,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Comentário raiz</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

describe('Comment', () => {
    const tree = makeComment({
        comments: [
            makeComment({
                id: 2,
                user: 'bob',
                content: '<p>Resposta</p>',
                comments: [makeComment({ id: 3, user: 'carol', content: '<p>Resposta aninhada</p>' })],
            }),
        ],
    });

    it('renderiza comentários aninhados recursivamente', () => {
        renderWithProviders(<Comment comment={tree} />);
        expect(screen.getByText('Comentário raiz')).toBeInTheDocument();
        expect(screen.getByText('Resposta')).toBeInTheDocument();
        expect(screen.getByText('Resposta aninhada')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'carol' })).toHaveAttribute('href', '/user/carol');
    });

    it('colapsa e expande a subárvore', async () => {
        renderWithProviders(<Comment comment={tree} />);
        const [rootToggle] = screen.getAllByRole('button');
        await userEvent.click(rootToggle);
        expect(rootToggle).toHaveTextContent('[+]');
        expect(screen.getByText('Resposta')).not.toBeVisible();
        await userEvent.click(rootToggle);
        expect(rootToggle).toHaveTextContent('[-]');
        expect(screen.getByText('Resposta')).toBeVisible();
    });

    it('mostra marcador para comentários deletados', () => {
        renderWithProviders(<Comment comment={makeComment({ deleted: true })} />);
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.queryByText('Comentário raiz')).not.toBeInTheDocument();
    });

    it('sanitiza o HTML do comentário', () => {
        const { container } = renderWithProviders(
            <Comment comment={makeComment({ content: '<p>ok</p><img src=x onerror="alert(1)">' })} />
        );
        expect(container.querySelector('img')).not.toHaveAttribute('onerror');
    });
});
