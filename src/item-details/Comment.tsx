import { useState } from 'react';
import { Link } from 'react-router';
import clsx from 'clsx';

import type { Comment as CommentModel } from '../shared/models/comment';
import { sanitizeHtml } from '../shared/utils/sanitize';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment">
            <div className={clsx('meta', { 'meta-collapse': collapse })}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={sanitizeHtml(comment.content)}></p>
                    <ul className="subtree">
                        {comment.comments?.map((subComment) => (
                            <li key={subComment.id}>
                                <Comment comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
