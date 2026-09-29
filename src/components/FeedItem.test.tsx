import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import type { Story } from '../types';
import { renderWithProviders } from '../test/helpers';
import FeedItem from './FeedItem';

const story: Story = {
    id: 42,
    title: 'A great story',
    text: '',
    content: '',
    points: 123,
    user: 'pg',
    time: 1700000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

describe('FeedItem', () => {
    it('links the title to the external url with the domain', () => {
        renderWithProviders(<FeedItem item={story} />);

        const title = screen.getByRole('link', { name: 'A great story' });
        expect(title).toHaveAttribute('href', 'https://example.com/article');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(title).toHaveStyle({ fontSize: '16px' });
    });

    it('shows points, author and comments in the laptop subtext', () => {
        renderWithProviders(<FeedItem item={story} />);

        expect(screen.getByText(/123 points by/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'pg' })[0]).toHaveAttribute('href', '/user/pg');
        expect(screen.getAllByRole('link', { name: '7 comments' })[0]).toHaveAttribute('href', '/item/42');
        expect(screen.getAllByText(/2 hours ago/).length).toBeGreaterThan(0);
    });

    it('links text-only items to the item page', () => {
        const textPost = { ...story, url: 'item?id=42' };
        renderWithProviders(<FeedItem item={textPost} />);

        expect(screen.getByRole('link', { name: 'A great story' })).toHaveAttribute('href', '/item/42');
    });

    it('hides points/comments for jobs', () => {
        const job = { ...story, type: 'job' as const };
        renderWithProviders(<FeedItem item={job} />);

        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /comments/ })).not.toBeInTheDocument();
    });

    it('opens links in a new tab when the setting is enabled', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderWithProviders(<FeedItem item={story} />);

        expect(screen.getByRole('link', { name: 'A great story' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'A great story' })).toHaveAttribute('rel', 'noopener');
        localStorage.clear();
    });
});
