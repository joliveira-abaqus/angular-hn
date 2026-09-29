import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';

import type { Story } from '../types';
import { renderWithProviders } from '../test/helpers';
import Feed from './Feed';

vi.mock('../api/hackerNewsApi', () => ({
    fetchFeed: vi.fn(),
}));

import { fetchFeed } from '../api/hackerNewsApi';
const mockFetchFeed = vi.mocked(fetchFeed);

function makeStory(id: number): Story {
    return {
        id,
        title: `Story ${id}`,
        text: '',
        content: '',
        points: id,
        user: 'user',
        time: 1700000000,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 0,
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    };
}

function renderFeed(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/news/:page" element={<Feed feedType="news" />} />
        </Routes>,
        [route]
    );
}

describe('Feed', () => {
    beforeEach(() => {
        mockFetchFeed.mockReset();
    });

    it('shows the loader and then the stories', async () => {
        let resolve!: (stories: Story[]) => void;
        mockFetchFeed.mockReturnValue(new Promise((r) => (resolve = r)));
        renderFeed('/news/1');

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        resolve([makeStory(1)]);
        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(mockFetchFeed).toHaveBeenCalledWith('news', 1);
    });

    it('shows Prev and More links on middle pages when the feed is full', async () => {
        mockFetchFeed.mockResolvedValue(Array.from({ length: 30 }, (_, i) => makeStory(i + 1)));
        renderFeed('/news/3');

        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/2');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/4');
    });

    it('hides Prev on the first page and More when the feed is short', async () => {
        mockFetchFeed.mockResolvedValue([makeStory(1)]);
        renderFeed('/news/1');

        await waitFor(() => expect(screen.getByText('Story 1')).toBeInTheDocument());
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        mockFetchFeed.mockRejectedValue(new Error('boom'));
        renderFeed('/news/1');

        await waitFor(() =>
            expect(screen.getByText('Could not load news stories.')).toBeInTheDocument()
        );
    });
});
