import React from 'react';
import { Navigate } from 'react-router-dom';

export default function HowToPlay() {
    return <Navigate to='/lobby?tab=lobby-how-to-play' replace />;
}
