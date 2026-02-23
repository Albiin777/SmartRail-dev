import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SmartRailProvider } from "./hooks/useSmartRail";
import { supabase } from "./supabaseClient";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import InspectionPage from "./pages/InspectionPage";
import PenaltyPage from "./pages/PenaltyPage";
import RACPage from "./pages/RACPage";
import ReportsPage from "./pages/ReportsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import TrainDirectoryPage from "./pages/TrainDirectoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import SupportPage from "./pages/SupportPage";
import IncidentsPage from "./pages/IncidentsPage";
import HandoverPage from "./pages/HandoverPage";
import SeatManagementPage from "./pages/SeatManagementPage";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <SmartRailProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/inspection" element={<InspectionPage />} />
          <Route path="/penalties" element={<PenaltyPage />} />
          <Route path="/rac-upgrades" element={<RACPage />} />
          <Route path="/train-directory" element={<TrainDirectoryPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/seat-management" element={<SeatManagementPage />} />
          <Route path="/handover" element={<HandoverPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </SmartRailProvider>
  );
}

export default App;
