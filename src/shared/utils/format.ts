/** Equivalente ao antigo CommentPipe: "1 comment", "N comments" ou "discuss". */
export function formatCommentCount(count: number): string {
    if (count > 0) {
        return `${count} ${count === 1 ? 'comment' : 'comments'}`;
    }
    return 'discuss';
}

/** Links internos do HN (ex.: "item?id=123") não começam com http e abrem a página de detalhes. */
export function hasExternalUrl(url: string | undefined): boolean {
    return !!url && url.indexOf('http') === 0;
}
