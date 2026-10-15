import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Comment } from '../components/Comment';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { externalLinkProps, hasExternalUrl } from '../components/StoryItem';
import { useSettings } from '../context/SettingsContext';
import { useItem } from '../hooks/queries';
import { formatCommentCount, sanitizeHtml } from '../utils/comment';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
    const params = useParams();
    const id = Number(params['id']);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, isError } = useItem(id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const linkProps = externalLinkProps(settings.openLinkInNewTab);

    const title = item ? (
        hasExternalUrl(item) ? (
            <a className="title" href={item.url} {...linkProps}>
                {item.title}
            </a>
        ) : (
            <Link className="title" to={`/item/${item.id}`}>
                {item.title}
            </Link>
        )
    ) : null;

    const laptopHeaderClasses = item
        ? ['laptop', item.comments_count > 0 || item.type === 'job' ? 'item-header' : '', item.text ? 'head-margin' : '']
              .filter(Boolean)
              .join(' ')
        : 'laptop';

    return (
        <div className="item-details-page main-content">
            {!item && !isError && <Loader />}
            {!item && isError && <ErrorMessage message="Could not load item comments." />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" aria-label="Back" onClick={() => navigate(-1)}></span>
                            {title}
                        </p>
                    </div>
                    <div className={laptopHeaderClasses}>
                        <p>
                            {title}
                            {hasExternalUrl(item) && item.domain && <span className="domain"> ({item.domain})</span>}
                        </p>
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                                </span>
                            )}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
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
                            {item.poll.map((pollResult, i) => (
                                <div key={i} className="pollContent">
                                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: `${item.poll_votes_count ? (pollResult.points / item.poll_votes_count) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                    <ul className="comment-list">
                        {item.comments?.map(comment => (
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
