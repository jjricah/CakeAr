// frontend/src/components/MainLayoutRoute.jsx
import React, { useState } from 'react';
import MainLayout from './MainLayout';

const MainLayoutRoute = ({ children, showTabs = false, showNav = true, fullWidth = false }) => {
  const [activeTab, setActiveTab] = useState('home');
  
  const clonedChildren = React.cloneElement(children, { 
    activeTab: showTabs ? activeTab : undefined, 
    setActiveTab: showTabs ? setActiveTab : undefined 
  });

  return (
    <MainLayout activeTab={activeTab} setActiveTab={showTabs ? setActiveTab : undefined} showNav={showNav} fullWidth={fullWidth}>
      {clonedChildren}
    </MainLayout>
  );
};

export default MainLayoutRoute;

