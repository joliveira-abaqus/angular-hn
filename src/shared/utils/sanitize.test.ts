import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
    it('remove scripts e handlers mantendo a marcação', () => {
        const { __html } = sanitizeHtml('<p onclick="x()">hi<script>alert(1)</script><a href="https://a.b">l</a></p>');
        expect(__html).toBe('<p>hi<a href="https://a.b">l</a></p>');
    });

    it('aceita conteúdo vazio', () => {
        expect(sanitizeHtml(undefined).__html).toBe('');
    });
});
