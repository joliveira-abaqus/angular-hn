import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '../test/helpers';
import UserProfile from './UserProfile';

vi.mock('../api/hackerNewsApi', () => ({
    fetchUser: vi.fn(),
}));

import { fetchUser } from '../api/hackerNewsApi';
const mockFetchUser = vi.mocked(fetchUser);

function renderUser(route = '/user/pg') {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<UserProfile />} />
        </Routes>,
        [route]
    );
}

describe('UserProfile', () => {
    beforeEach(() => {
        mockFetchUser.mockReset();
    });

    it('renders the user details', async () => {
        mockFetchUser.mockResolvedValue({
            id: 'pg',
            crated_time: 1000,
            created: 'October 9, 2006',
            karma: 157286,
            avg: 4.5,
            about: '<p>Founder</p>',
        });
        renderUser();

        await waitFor(() => expect(screen.getByText('pg')).toBeInTheDocument());
        expect(mockFetchUser).toHaveBeenCalledWith('pg');
        expect(screen.getByText('157286 ★')).toBeInTheDocument();
        expect(screen.getByText('Created October 9, 2006')).toBeInTheDocument();
        expect(screen.getByText('Founder')).toBeInTheDocument();
    });

    it('shows an error message when the request fails', async () => {
        mockFetchUser.mockRejectedValue(new Error('boom'));
        renderUser('/user/ghost');

        await waitFor(() => expect(screen.getByText('Could not load user ghost.')).toBeInTheDocument());
    });
});
