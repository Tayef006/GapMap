import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Timetable from "./pages/Timetable";
import Tasks from "./pages/Tasks";
import Recommendations from "./pages/Recommendations";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;

      case "timetable":
        return <Timetable />;

      case "tasks":
        return <Tasks />;

      case "recommendations":
        return <Recommendations />;

      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>GapMap</h1>
        <p className="tagline">Turn dead time into useful time</p>
      </header>

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;