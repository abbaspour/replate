import React from 'react';

export default function ErrorPage() {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason') || 'unknown';
    return (
        <div className="container">
            <div className="card">
                <h2>Something went wrong</h2>
                <p>Reason: {reason}</p>
            </div>
        </div>
    );
}
