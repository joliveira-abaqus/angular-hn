import DOMPurify from 'dompurify';

/** Sanitiza o HTML vindo da API antes de usá-lo com dangerouslySetInnerHTML (como o DomSanitizer do Angular). */
export function sanitizeHtml(html: string | undefined): { __html: string } {
    return { __html: html ? DOMPurify.sanitize(html) : '' };
}
