/** Port of the Angular `comment` pipe: "3 comments", "1 comment", or "discuss". */
export function commentCount(count: number): string {
    if (count > 0) {
        const st = count === 1 ? 'comment' : 'comments';
        return `${count} ${st}`;
    }
    return 'discuss';
}
