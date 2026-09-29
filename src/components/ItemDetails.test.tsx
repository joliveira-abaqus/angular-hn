import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';

import type { Story } from '../types';
import { renderWithProviders } from '../test/helpers';
import ItemDetails from './ItemDetails';

vi.mock('../api/hackerNewsApi', () => ({
    fetchItemContent: vi.fn(),
}));

import { fetchItemContent } from '../api/hackerNewsApi';
const mockFetchItem = vi.mocked(fetchItemContent);

const story: Story = {
    id: 42,
    title: 'Ask HN: Something',
    text: 'body',
    content: '<p>item body</p>',
    points: 50,
    user: 'pg',
    time: 1700000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'item?id=42',
    domain: '',
    comments: [
        {
            id: 100,
            level: 0,
            user: 'dhouston',
            time: 1700000100,
            time_ago: '1 hour ago',
            content: 'First comment',
            deleted: false,
            comments: [],
        },
    ],
    comments_count: 1,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
};

function renderItem(route = '/item/42') {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        [route]
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        mockFetchItem.mockReset();
    });

    it('renders the story, meta and comments', async () => {
        mockFetchItem.mockResolvedValue(story);
        renderItem();

        await waitFor(() => expect(screen.getAllByText('Ask HN: Something').length).toBeGreaterThan(0));
        expect(mockFetchItem).toHaveBeenCalledWith(42);
        expect(screen.getByText('item body')).toBeInTheDocument();
        expect(screen.getByText('First comment')).toBeInTheDocument();
        expect(screen.getByText(/50 points by/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
    });

    it('shows an error message when the request fails', async () => {
        mockFetchItem.mockRejectedValue(new Error('boom'));
        renderItem();

        await waitFor(() => expect(screen.getByText('Could not load item comments.')).toBeInTheDocument());
    });

    it('renders poll results with bars', async () => {
        mockFetchItem.mockResolvedValue({
            ...story,
            type: 'poll',
            poll_votes_count: 15,
            poll: [
                { points: 10, content: '<p>option a</p>' },
                { points: 5, content: '<p>option b</p>' },
            ],
        });
        renderItem();

        await waitFor(() => expect(screen.getByText('option a')).toBeInTheDocument());
        expect(screen.getByText('10 points')).toBeInTheDocument();
        expect(screen.getByText('5 points')).toBeInTheDocument();
    });
});
