import React from "react";

function Home() {
  return (
    <section className="page-card">
      <h2>Welcome to GapMap</h2>
      <p>
        GapMap helps students make better use of awkward free time between
        classes, labs, work shifts, and study sessions.
      </p>

      <div className="home-section">
        <h3>How it works</h3>
        <p>
          Add your timetable entries and tasks, then let GapMap detect free
          gaps in your day and suggest tasks that realistically fit those time
          windows.
        </p>
      </div>

      <div className="home-section">
        <h3>What you can do</h3>
        <ul className="home-list">
          <li>Add and manage timetable entries</li>
          <li>Create tasks with duration, priority, and energy level</li>
          <li>View recommendations for free timetable gaps</li>
          <li>Check a dashboard summary of your activity</li>
        </ul>
      </div>

      <div className="home-section">
        <h3>Why it is useful</h3>
        <p>
          Instead of wasting short breaks between classes, GapMap helps you find
          realistic tasks that match the time and energy you actually have.
        </p>
      </div>
    </section>
  );
}

export default Home;