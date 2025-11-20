import { Routes, Route } from 'react-router-dom';
import EntryPage from './routes/EntryPage/EntryPage';
import PlayPage from './routes/PlayPage/PlayPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/play" element={<PlayPage />} />
    </Routes>
  );
}

export default App;
