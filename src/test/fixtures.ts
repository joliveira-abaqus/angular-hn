import type { Story } from '../models/story';

export function makeStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'Uma story',
        text: '',
        content: '',
        points: 42,
        user: 'pg',
        time: 0,
        time_ago: '2 hours ago' as unknown as number,
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        poll: [],
        poll_votes_count: undefined as unknown as number,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

export function makeFeed(count: number, offset = 0): Story[] {
    return Array.from({ length: count }, (_, i) =>
        makeStory({ id: offset + i + 1, title: `Story ${offset + i + 1}` })
    );
}
