import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';
import SignUp from '../pages/SignUp';
import SignOut from '../pages/SignOut';
import NavBar from '../components/NavBar';
import SignIn from '../pages/SignIn';
import NotAuthorized from '../pages/NotAuthorized';
import LoadingSpinner from '../components/LoadingSpinner';
import AddLostItem from '../pages/AddLostItem';
import AddFoundItem from '../pages/AddFoundItem';
import ListFoundItem from '../pages/ListFoundItem';
import EditFoundItem from '../pages/EditFoundItem';
import ResolvedArchive from '../pages/ResolvedArchive';
import ListLostItem from '../pages/ListLostItem';
import EditLostItem from '../pages/EditLostItem';
import ListMyItem from '../pages/ListMyItem';
import ListFoundItemAdmin from '../pages/ListFoundItemAdmin';
import ListLostItemAdmin from '../pages/ListLostItemAdmin';
import { ResolveLostItem } from '../pages/ResolveLostItem';
import { ResolveFoundItem } from '../pages/ResolveFoundItem';
import ListProfiles from '../pages/ListProfiles';
import ProfileInfo from '../pages/ProfileInfo';

/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
const App = () => {
  const { ready } = useTracker(() => {
    const rdy = Roles.subscription.ready();
    return {
      ready: rdy,
    };
  });
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavBar />
        <Routes>
          <Route exact path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/home" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
          <Route path="/listfound" element={<ProtectedRoute><ListFoundItem /></ProtectedRoute>} />
          <Route path="/listlost" element={<ProtectedRoute><ListLostItem /></ProtectedRoute>} />
          <Route path="/listmy" element={<ProtectedRoute><ListMyItem /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><ResolvedArchive /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddLostItem /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><ListProfiles /></ProtectedRoute>} />
          <Route path="/addfound" element={<ProtectedRoute><AddFoundItem /></ProtectedRoute>} />
          <Route path="/editfound/:_id" element={<ProtectedRoute><EditFoundItem /></ProtectedRoute>} />
          <Route path="/editlost/:_id" element={<ProtectedRoute><EditLostItem /></ProtectedRoute>} />
          <Route path="/resolvelost/:_id/:_userId" element={<ProtectedRoute><ResolveLostItem /></ProtectedRoute>} />
          <Route path="/profile/:_userId" element={<ProtectedRoute><ProfileInfo /></ProtectedRoute>} />
          <Route path="/resolvefound/:_id/:_userId" element={<ProtectedRoute><ResolveFoundItem /></ProtectedRoute>} />
          <Route path="/foundadmin" element={<AdminProtectedRoute ready={ready}><ListFoundItemAdmin /></AdminProtectedRoute>} />
          <Route path="/lostadmin" element={<AdminProtectedRoute ready={ready}><ListLostItemAdmin /></AdminProtectedRoute>} />
          <Route path="/notauthorized" element={<NotAuthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

/*
 * ProtectedRoute (see React Router v6 sample)
 * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const ProtectedRoute = ({ children }) => {
  const isLogged = Meteor.userId() !== null;
  return isLogged ? children : <Navigate to="/signin" />;
};

/**
 * AdminProtectedRoute (see React Router v6 sample)
 * Checks for Meteor login and admin role before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const AdminProtectedRoute = ({ ready, children }) => {
  const isLogged = Meteor.userId() !== null;
  if (!isLogged) {
    return <Navigate to="/signin" />;
  }
  if (!ready) {
    return <LoadingSpinner />;
  }
  const isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');
  return (isLogged && isAdmin) ? children : <Navigate to="/notauthorized" />;
};

// Require a component and location to be passed to each ProtectedRoute.
ProtectedRoute.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

ProtectedRoute.defaultProps = {
  children: <Landing />,
};

// Require a component and location to be passed to each AdminProtectedRoute.
AdminProtectedRoute.propTypes = {
  ready: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

AdminProtectedRoute.defaultProps = {
  ready: false,
  children: <Landing />,
};

export default App;
