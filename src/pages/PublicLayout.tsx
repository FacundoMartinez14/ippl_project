import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import WhatsAppButton from '../components/common/WhatsAppButton';

const PublicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <WhatsAppButton />
      {location.pathname !== '/' && <Footer />}
    </div>
  );
};

export default PublicLayout;