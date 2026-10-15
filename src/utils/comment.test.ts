import { describe, expect, it } from 'vitest';

import { formatCommentCount, sanitizeHtml } from './comment';

describe('formatCommentCount', () => {
    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [2, '2 comments'],
        [150, '150 comments'],
    ])('%i -> %s', (count, expected) => {
        expect(formatCommentCount(count)).toBe(expected);
    });
});

describe('sanitizeHtml', () => {
    it('mantém a formatação do HN', () => {
        const html = '<p>Olá <i>mundo</i></p><pre><code>x = 1</code></pre><a href="https://hn.com">link</a>';
        expect(sanitizeHtml(html)).toBe(html);
    });

    it('remove scripts e handlers inline', () => {
        const clean = sanitizeHtml('<img src="x" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a>');
        expect(clean).not.toContain('onerror');
        expect(clean).not.toContain('<script');
        expect(clean).not.toContain('javascript:');
    });

    it('adiciona rel=noopener em links com target=_blank', () => {
        expect(sanitizeHtml('<a href="https://hn.com" target="_blank">x</a>')).toContain('rel="noopener noreferrer"');
    });

    it('retorna string vazia para conteúdo ausente', () => {
        expect(sanitizeHtml(undefined)).toBe('');
        expect(sanitizeHtml(null)).toBe('');
    });
});
