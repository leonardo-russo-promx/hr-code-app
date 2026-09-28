import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AbsenceRequestsPage } from './pages/AbsenceRequestsPage';
import { HolidaysPage } from './pages/HolidaysPage';
import { FaqPage } from './pages/FaqPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SkillsPage } from './pages/SkillsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="absences" element={<AbsenceRequestsPage />} />
          <Route path="holidays" element={<HolidaysPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
