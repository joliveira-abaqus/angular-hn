import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchFeed } from '../api/hackerNewsApi';
import { useFetch } from '../hooks/useFetch';
import type { Story } from '../types';
import ErrorMessage from './ErrorMessage';
import FeedItem from './FeedItem';
import Loader from './Loader';
import './Feed.scss';

export default function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    const pageNum = page ? +page : 1;
    const { data: items, error } = useFetch<Story[]>(() => fetchFeed(feedType, pageNum), [feedType, pageNum]);
    const listStart = (pageNum - 1) * 30 + 1;
    const errorMessage = error ? `Could not load ${feedType} stories.` : '';

    useEffect(() => {
        if (items) {
            window.scrollTo(0, 0);
        }
    }, [items]);

    return (
        <div className="main-content feed-page">
            {!items && !error && <Loader />}
            {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {items && (
                <div>
                    {feedType === 'jobs' && (
                        <p className="job-header">
                            These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC
                            startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
                        </p>
                    )}
                    <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
                        {items.map((item) => (
                            <li key={item.id} className="post">
                                <FeedItem item={item} />
                            </li>
                        ))}
                    </ol>
                    <div className="nav">
                        {listStart !== 1 && (
                            <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                                ‹ Prev
                            </Link>
                        )}
                        {items.length === 30 && (
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
