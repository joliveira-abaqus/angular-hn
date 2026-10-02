import { formatCommentCount, hasExternalUrl } from './format';

describe('formatCommentCount', () => {
    it('mostra "discuss" sem comentários', () => {
        expect(formatCommentCount(0)).toBe('discuss');
    });

    it('usa singular e plural', () => {
        expect(formatCommentCount(1)).toBe('1 comment');
        expect(formatCommentCount(5)).toBe('5 comments');
    });
});

describe('hasExternalUrl', () => {
    it('identifica URLs externas', () => {
        expect(hasExternalUrl('https://example.com')).toBe(true);
        expect(hasExternalUrl('item?id=1')).toBe(false);
        expect(hasExternalUrl(undefined)).toBe(false);
    });
});
