import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import clsx from 'clsx';

import { useFeed } from '../api/queries';
import type { FeedName } from '../shared/models/feed-type.type';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { Item } from './Item';
import './Feed.scss';

export const PAGE_SIZE = 30;

export function Feed({ feedType }: { feedType: FeedName }) {
    const params = useParams<{ page: string }>();
    const pageNum = params.page ? Number(params.page) : 1;
    const { data: items, isError } = useFeed(feedType, pageNum);
    const listStart = (pageNum - 1) * PAGE_SIZE + 1;

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content feed">
            {!items && !isError && <Loader />}
            {!items && isError && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={clsx({ 'list-margin': feedType !== 'jobs' })} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <Item item={item} />
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
