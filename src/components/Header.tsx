import { NavLink } from 'react-router-dom';

import { useSettings } from '../context/SettingsContext';
import { Settings } from './Settings';
import './Header.scss';

const FEEDS = [
    { to: '/newest/1', label: 'new' },
    { to: '/show/1', label: 'show' },
    { to: '/ask/1', label: 'ask' },
    { to: '/jobs/1', label: 'jobs' },
];

function scrollTop() {
    window.scrollTo(0, 0);
}

export function Header() {
    const { settings, toggleSettings } = useSettings();

    return (
        <header className="app-header">
            <div id="header">
                <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text">
                    <div className="left">
                        <span className="header-nav">
                            {FEEDS.map((feed, i) => (
                                <span key={feed.to}>
                                    {i > 0 && ' | '}
                                    <NavLink to={feed.to} onClick={scrollTop}>
                                        {feed.label}
                                    </NavLink>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
                <div className="info">
                    <img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
                </div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
