import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import WhatsAppButton from '../components/common/WhatsAppButton';

const PublicLayout = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <Outlet />
        </main>
      </div>
      <WhatsAppButton />
    </>
  );
};

export default PublicLayout;