import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Assessment } from './pages/Assessment';

function App() {
  return (
    <BrowserRouter basename="/CU_FRSP">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/assessment" element={<Assessment />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
