import React from "react";

function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { key: "home", label: "Home" },
    { key: "dashboard", label: "Dashboard" },
    { key: "timetable", label: "Timetable" },
    { key: "tasks", label: "Tasks" },
    { key: "recommendations", label: "Recommendations" },
  ];

  return (
    <nav className="nav">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={currentPage === item.key ? "nav-button active" : "nav-button"}
          onClick={() => setCurrentPage(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default Navbar;