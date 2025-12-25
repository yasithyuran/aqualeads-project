import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddInterior from './components/AddInterior';
import AddArticles from './components/AddArticles';
import AddImEx from './components/AddImEx'; 
import AddProducts from './components/AddProducts';
import AddLiveItem from './components/AddLiveItem';
import AddAccess from './components/AddAccess';
import ManageArticles from './components/ManageArticles';
import ManageImEx from './components/ManageImEx';
import ManageInterior from './components/ManageInterior';
import ManageAccessories from './components/ManageAccessories';
import ManageLivestock from './components/ManageLivestock';
import './App.css';
import ManageProducts from './components/ManageProducts';
import AddAriums from './components/AddAriums';
import ManageAriums from './components/ManageAriums';


function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  // Public Route Component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addarticles"
            element={
              <ProtectedRoute>
                <AddArticles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addaccess"
            element={
              <ProtectedRoute>
                <AddAccess />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/addinterior"
            element={
              <ProtectedRoute>
                <AddInterior />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addimex"
            element={
              <ProtectedRoute>
                <AddImEx />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addproducts"
            element={
              <ProtectedRoute>
                <AddProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addliveitem"
            element={
              <ProtectedRoute>
                <AddLiveItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/managearticles"
            element={
              <ProtectedRoute>
                <ManageArticles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manageimex"
            element={
              <ProtectedRoute>
                <ManageImEx />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manageinterior"
            element={
              <ProtectedRoute>
                <ManageInterior />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manageaccessories"
            element={
              <ProtectedRoute>
                <ManageAccessories />
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW: Manage Livestock Route */}
          <Route
            path="/managelivestock"
            element={
              <ProtectedRoute>
                <ManageLivestock />
              </ProtectedRoute>
            }
          />
           {/* ✅ NEW: Manage Livestock Route */}
          <Route
            path="/manageproducts"
            element={
              <ProtectedRoute>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addariums"
            element={
              <ProtectedRoute>
                <AddAriums />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manageariums"
            element={
              <ProtectedRoute>
                <ManageAriums />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated() ? '/dashboard' : '/login'}
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;