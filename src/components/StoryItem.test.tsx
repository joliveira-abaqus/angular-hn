import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeStory } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import { StoryItem } from './StoryItem';

describe('StoryItem', () => {
    it('mostra título com link externo, domínio, pontos, autor e comentários', () => {
        renderWithProviders(<StoryItem item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'Uma story' });
        expect(title).toHaveAttribute('href', 'https://example.com/post');
        expect(title).not.toHaveAttribute('target');
        expect(screen.getAllByText('(example.com)')[0]).toBeInTheDocument();
        expect(screen.getByText(/42 points by/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getAllByRole('link', { name: /3 comments/ })[0]).toHaveAttribute('href', '/item/1');
    });

    it('abre o link em nova aba quando openLinkInNewTab está ativo', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<StoryItem item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'Uma story' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('usa link interno para posts sem URL externa (Ask HN)', () => {
        renderWithProviders(<StoryItem item={makeStory({ id: 9, url: 'item?id=9', domain: '' })} />);
        expect(screen.getByRole('link', { name: 'Uma story' })).toHaveAttribute('href', '/item/9');
    });

    it('esconde autor e comentários em jobs', () => {
        renderWithProviders(<StoryItem item={makeStory({ type: 'job' })} />);
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comments/ })).not.toBeInTheDocument();
    });

    it('aplica tamanho de fonte e espaçamento das settings', () => {
        localStorage.setItem('titleFontSize', '24');
        localStorage.setItem('listSpacing', '12');
        const { container } = renderWithProviders(<StoryItem item={makeStory()} />);
        expect(screen.getByRole('link', { name: 'Uma story' })).toHaveStyle({ fontSize: '24px' });
        expect(container.querySelector('.story-item')).toHaveStyle({ marginBottom: '12px' });
    });
});
