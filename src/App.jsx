import React, { useState } from 'react';
import { useGame, GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Sales from './components/Sales';
import TMS from './components/TMS';
import Brokerage from './components/Brokerage';
import Analytics from './components/Analytics';
import Wiki from './components/Wiki';
import SetupScreen from './components/SetupScreen';

const GameContent = () => {
  const { state, dispatch } = useGame();

  // Helper to change tab via context
  const setActiveTab = (tab) => dispatch({ type: 'NAVIGATE', payload: tab });

  if (!state.gameStarted) {
    return <SetupScreen />;
  }

  return (
    <Layout activeTab={state.activeTab} setActiveTab={setActiveTab}>
      {state.activeTab === 'sales' && <Sales />}
      {state.activeTab === 'tms' && <TMS setActiveTab={setActiveTab} />}
      {state.activeTab === 'brokerage' && <Brokerage />}
      {state.activeTab === 'analytics' && <Analytics />}
      {state.activeTab === 'wiki' && <Wiki />}
    </Layout>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
