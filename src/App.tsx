import { Navigate, Route, Routes } from 'react-router';

import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { WelcomePage } from './pages/WelcomePage';

export const App = () => (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);
