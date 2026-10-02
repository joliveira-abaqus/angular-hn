import { useNavigate, useParams } from 'react-router';

import { useUser } from '../api/queries';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { sanitizeHtml } from '../shared/utils/sanitize';
import './User.scss';

export default function User() {
    const { id = '' } = useParams<{ id: string }>();
    const { data: user, isError } = useUser(id);
    const navigate = useNavigate();

    return (
        <div className="user-page">
            {!user && !isError && <Loader />}
            {!user && isError && <ErrorMessage message={`Could not load user ${id}.`} />}

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
                            <p dangerouslySetInnerHTML={sanitizeHtml(user.about)}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
