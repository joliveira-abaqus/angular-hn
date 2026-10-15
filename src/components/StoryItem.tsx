import { Link } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models/story';
import { formatCommentCount } from '../utils/comment';
import './StoryItem.scss';

export function hasExternalUrl(story: Story): boolean {
    return !!story.url && story.url.indexOf('http') === 0;
}

export function externalLinkProps(openLinkInNewTab: boolean) {
    return openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
}

export function StoryItem({ item }: { item: Story }) {
    const { settings } = useSettings();
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const isJob = item.type === 'job';

    return (
        <div className="story-item" style={{ marginBottom: `${settings.listSpacing}px` }}>
            {hasExternalUrl(item) ? (
                <p>
                    <a
                        className="title"
                        style={titleStyle}
                        href={item.url}
                        {...externalLinkProps(settings.openLinkInNewTab)}
                    >
                        {item.title}
                    </a>
                    {item.domain && <span className="domain"> ({item.domain})</span>}
                </p>
            ) : (
                <p>
                    <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
                        {item.title}
                    </Link>
                </p>
            )}
            <div className="subtext-palm">
                {!isJob && (
                    <div className="details">
                        <span className="name">
                            <Link to={`/user/${item.user}`}>{item.user}</Link>
                        </span>
                        <span className="right">{item.points} ★</span>
                    </div>
                )}
                <div className="details">
                    {item.time_ago}
                    {!isJob && (
                        <Link to={`/item/${item.id}`} className="comment-number">
                            {' • '}
                            {formatCommentCount(item.comments_count)}
                        </Link>
                    )}
                </div>
            </div>
            <div className="subtext-laptop">
                {!isJob && (
                    <span>
                        {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
                    </span>
                )}
                <span className={isJob ? undefined : 'item-details'}>
                    {item.time_ago}
                    {!isJob && (
                        <span>
                            {' | '}
                            <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
