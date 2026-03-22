import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import { ThemeProvider } from "@/lib/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import ExperiencePage from "@/pages/ExperiencePage";
import GalleryPage from "@/pages/GalleryPage";
import ContactPage from "@/pages/ContactPage";
import ProjectDemoPage from "@/pages/ProjectDemoPage";
import AdminPage from "@/admin/AdminPage";

function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg transition-colors duration-300">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function AppShell() {
  useSmoothScroll();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return <AdminPage />;
  }

  return (
    <Routes location={location}>
      <Route path="/projects/:id/demo" element={<ProjectDemoPage />} />
      <Route path="*" element={<MainLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
