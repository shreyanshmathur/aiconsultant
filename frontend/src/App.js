import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Research from "./pages/Research";
import Consulting from "./pages/Consulting";
import Deliverables from "./pages/Deliverables";
import Settings from "./pages/Settings";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/research" element={<Research />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/deliverables" element={<Deliverables />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
