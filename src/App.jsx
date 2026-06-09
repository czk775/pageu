import { Route, Routes } from 'react-router-dom';
import { AnalyzePage } from './pages/AnalyzePage';
import { CreatePage } from './pages/CreatePage';
import { EditorPage } from './pages/EditorPage';
import { GeneratedSitePage } from './pages/GeneratedSitePage';
import { HomePage } from './pages/HomePage';
import { PublishPage } from './pages/PublishPage';
import { CreateDraftProvider } from './state/CreateDraftContext';

export default function App() {
  return (
    <CreateDraftProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/site/:id" element={<GeneratedSitePage />} />
      </Routes>
    </CreateDraftProvider>
  );
}
