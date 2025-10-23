import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

export default function Callback() {
    const location = useLocation();
    const navigate = useNavigate();

    // Auth0Provider onRedirectCallback will navigate; this is a visual placeholder
    useEffect(() => {
        const t = setTimeout(() => {
            const params = new URLSearchParams(location.search);
            const returnTo = sessionStorage.getItem('app:returnTo');
            navigate(returnTo || '/', {replace: true});
        }, 1200);
        return () => clearTimeout(t);
    }, [location.pathname]);

    return (
        <div className="container">
            <div className="card">
                <h2>Signing you in…</h2>
                <p>Please wait while we complete the login process.</p>
            </div>
        </div>
    );
}
