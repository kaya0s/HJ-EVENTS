import { Routes, Route } from 'react-router-dom';
import { ClientHomePage } from '@/pages/client/ClientHomePage';

export const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<ClientHomePage />} />
    </Routes>
  );
};
