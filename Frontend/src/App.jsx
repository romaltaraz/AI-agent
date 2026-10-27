import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { APP_NAME } from "./config";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";

export default function App() {
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <div className="app">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
