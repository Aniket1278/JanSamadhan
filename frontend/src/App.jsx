import { NavLink, Route, Routes } from 'react-router-dom';
import { getUser } from './api.js';
import Home from './pages/Home.jsx';
import Submit from './pages/Submit.jsx';
import Track from './pages/Track.jsx';
import Directory from './pages/Directory.jsx';
import Scorecard from './pages/Scorecard.jsx';
import Login from './pages/Login.jsx';
import Official from './pages/Official.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const user = getUser();
  const logout = () => { localStorage.clear(); location.href = '/'; };
  return (
    <>
      <header>
        <span className="brand">Jan<b>Samadhan</b></span>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/submit">Submit</NavLink>
        <NavLink to="/track">Track</NavLink>
        <NavLink to="/complaints">Public complaints</NavLink>
        <NavLink to="/scorecard">Scorecard</NavLink>
        {user?.role === 'official' && <NavLink to="/official">Official panel</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user ? <a href="#" onClick={logout}>Log out ({user.name})</a> : <NavLink to="/login">Log in</NavLink>}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/track" element={<Track />} />
          <Route path="/complaints" element={<Directory />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/official" element={<Official />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <footer>
        JanSamadhan is an independent, privately run citizen platform. It is not affiliated with or authorized
        by the Government of India or any State Government.
      </footer>
    </>
  );
}
