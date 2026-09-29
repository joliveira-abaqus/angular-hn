import { describe, expect, it } from 'vitest';

import { commentCount } from './comments';

describe('commentCount', () => {
    it('returns "discuss" when there are no comments', () => {
        expect(commentCount(0)).toBe('discuss');
    });

    it('uses the singular for a single comment', () => {
        expect(commentCount(1)).toBe('1 comment');
    });

    it('uses the plural for multiple comments', () => {
        expect(commentCount(42)).toBe('42 comments');
    });
});
