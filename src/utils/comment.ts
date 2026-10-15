import DOMPurify from 'dompurify';

/** Equivalente ao antigo `CommentPipe`: "discuss", "1 comment" ou "N comments". */
export function formatCommentCount(count: number): string {
    if (count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}

/**
 * Sanitiza o HTML vindo da API (comentários, texto de stories/polls, "about" do usuário)
 * antes de usá-lo em `dangerouslySetInnerHTML`, como o `[innerHTML]` do Angular fazia.
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) {
        return '';
    }
    const clean = DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    return clean;
}

DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
    }
});
