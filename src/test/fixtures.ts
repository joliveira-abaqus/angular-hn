import type { Comment } from '../shared/models/comment';
import type { Story } from '../shared/models/story';
import type { User } from '../shared/models/user';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        content: '',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago',
        type: 'link',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        ...overrides,
    };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
    return {
        id: 100,
        level: 0,
        user: 'alice',
        time: 0,
        time_ago: '1 hour ago',
        content: '<p>Top level</p>',
        deleted: false,
        comments: [],
        ...overrides,
    };
}

export const sampleUser: User = {
    id: 'pg',
    created_time: 0,
    created: '19 years ago',
    karma: 157000,
    about: '<a href="https://paulgraham.com">Bug fixer.</a>',
};
