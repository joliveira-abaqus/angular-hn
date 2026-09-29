import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Comment } from '../types';
import { renderWithProviders } from '../test/helpers';
import CommentItem from './CommentItem';

const comment: Comment = {
    id: 1,
    level: 0,
    user: 'dhouston',
    time: 1700000000,
    time_ago: '1 hour ago',
    content: 'Parent <i>comment</i>',
    deleted: false,
    comments: [
        {
            id: 2,
            level: 1,
            user: 'pg',
            time: 1700000100,
            time_ago: '50 minutes ago',
            content: 'Nested reply',
            deleted: false,
            comments: [],
        },
    ],
};

describe('CommentItem', () => {
    it('renders nested comments recursively', () => {
        renderWithProviders(<CommentItem comment={comment} />);

        expect(screen.getByText('dhouston')).toHaveAttribute('href', '/user/dhouston');
        expect(screen.getByText(/Parent/)).toBeInTheDocument();
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
    });

    it('collapses and expands the subtree', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CommentItem comment={comment} />);

        await user.click(screen.getAllByText('[-]')[0]);
        expect(screen.queryByText('Nested reply')).not.toBeInTheDocument();
        expect(screen.getByText('[+]')).toBeInTheDocument();

        await user.click(screen.getByText('[+]'));
        expect(screen.getByText('Nested reply')).toBeInTheDocument();
    });

    it('renders a deleted comment marker', () => {
        renderWithProviders(<CommentItem comment={{ ...comment, deleted: true }} />);

        expect(screen.getByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByText('dhouston')).not.toBeInTheDocument();
    });
});
