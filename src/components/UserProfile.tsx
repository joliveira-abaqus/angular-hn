import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackerNewsApi';
import { useFetch } from '../hooks/useFetch';
import type { User } from '../types';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import './UserProfile.scss';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: user, error } = useFetch<User>(() => fetchUser(id!), [id]);
    const errorMessage = error ? `Could not load user ${id}.` : '';

    return (
        <div className="user-page">
            {!user && !error && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
