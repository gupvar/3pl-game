import React, { useState, useEffect } from 'react';
import { useGame, GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Sales from './components/Sales';
import TMS from './components/TMS';
import Brokerage from './components/Brokerage';
import Analytics from './components/Analytics';
import Wiki from './components/Wiki';
import SetupScreen from './components/SetupScreen';
import GuideModal from './components/GuideModal';

const GameContent = () => {
  const { state, dispatch } = useGame();
  const [showGuide, setShowGuide] = useState(false);

  // Check tutorial status on mount
  useEffect(() => {
    const hasSeen = localStorage.getItem('nexus_tutorial_seen');
    if (!hasSeen) {
      setShowGuide(true);
      localStorage.setItem('nexus_tutorial_seen', 'true');
    }
  }, []);

  // Helper to change tab via context
  const setActiveTab = (tab) => dispatch({ type: 'NAVIGATE', payload: tab });

  if (!state.gameStarted) {
    return (
      <>
        <SetupScreen onShowGuide={() => setShowGuide(true)} />
        <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      </>
    );
  }

  return (
    <>
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <Layout activeTab={state.activeTab} setActiveTab={setActiveTab}>
        {state.activeTab === 'sales' && <Sales />}
        {state.activeTab === 'tms' && <TMS setActiveTab={setActiveTab} />}
        {state.activeTab === 'brokerage' && <Brokerage />}
        {state.activeTab === 'analytics' && <Analytics />}
        {state.activeTab === 'wiki' && <Wiki />}
      </Layout>
    </>
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
