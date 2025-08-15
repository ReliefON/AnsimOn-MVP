import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ServiceProvider } from "@/contexts/ServiceContext";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import PassAuth from "./pages/PassAuth";
import Home from "./pages/Home";
import ServiceRequest from "./pages/ServiceRequest";
import Matching from "./pages/Matching";
import SafeCam from "./pages/SafeCam";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import Technician from "./pages/Technician";
import TechnicianCamera from "./pages/TechnicianCamera";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <ServiceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pass-auth" element={<PassAuth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/service-request" element={<ServiceRequest />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/safe-cam" element={<SafeCam />} />
            <Route path="/technician" element={<TechnicianDashboard />} />
            <Route path="/technician/service/:serviceId" element={<Technician />} />
            <Route path="/technician/camera/:serviceId" element={<TechnicianCamera />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ServiceProvider>
  </AuthProvider>
);

export default App;