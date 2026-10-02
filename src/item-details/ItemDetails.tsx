import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import clsx from 'clsx';

import { useItem } from '../api/queries';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { formatCommentCount, hasExternalUrl } from '../shared/utils/format';
import { sanitizeHtml } from '../shared/utils/sanitize';
import { useSettings } from '../settings/SettingsContext';
import { Comment } from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const { data: item, isError } = useItem(itemId);
    const { settings } = useSettings();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [itemId]);

    const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="main-content item-page">
            {!item && !isError && <Loader />}
            {!item && isError && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasExternalUrl(item.url) ? (
                                <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    <div
                        className={clsx('laptop', {
                            'item-header': item.comments_count > 0 || item.type === 'job',
                            'head-margin': item.text,
                        })}
                    >
                        {hasExternalUrl(item.url) ? (
                            <p>
                                <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                                    {item.title}
                                </a>
                                {item.domain && (
                                    <>
                                        {' '}
                                        <span className="domain">({item.domain})</span>
                                    </>
                                )}
                            </p>
                        ) : (
                            <p>
                                <Link className="title" to={`/item/${item.id}`}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                                </span>
                            )}
                            <span className={clsx({ 'item-details': item.type !== 'job' })}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' | '}
                                        <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    {item.type === 'poll' && (
                        <div className="pollResults">
                            {item.poll?.map((pollResult, i) => (
                                <div key={i} className="pollContent">
                                    <div dangerouslySetInnerHTML={sanitizeHtml(pollResult.content)}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${(pollResult.points / (item.poll_votes_count || 1)) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={sanitizeHtml(item.content)}></p>
                    <ul className="comment-list">
                        {item.comments?.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
