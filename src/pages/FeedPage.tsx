import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { FeedName } from '../api/hackernews';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { StoryItem } from '../components/StoryItem';
import { useFeed } from '../hooks/queries';
import './FeedPage.scss';

const PAGE_SIZE = 30;

export function FeedPage({ feedType }: { feedType: FeedName }) {
    const params = useParams();
    const pageNum = params['page'] ? Number(params['page']) : 1;
    const { data: items, isError } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="feed-page main-content">
            {!items && !isError && <Loader />}
            {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a
                            YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map(item => (
                            <li key={item.id} className="post">
                                <StoryItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === PAGE_SIZE && (
                            <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                                More ›
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
