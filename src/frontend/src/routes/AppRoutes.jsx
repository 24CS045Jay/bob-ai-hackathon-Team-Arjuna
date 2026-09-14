import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingPage from '../pages/LandingPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import CongestionPage from '../pages/CongestionPage.jsx'
import RoutingPage from '../pages/RoutingPage.jsx'
import BerthPlannerPage from '../pages/BerthPlannerPage.jsx'
import VesselTrackingPage from '../pages/VesselTrackingPage.jsx'
import GateControllerPage from '../pages/GateControllerPage.jsx'
import EventCascadePage from '../pages/EventCascadePage.jsx'
import SimulationPage from '../pages/SimulationPage.jsx'
import PlanPage from '../pages/PlanPage.jsx'
import AlertsPage from '../pages/AlertsPage.jsx'
import AccessControlPage from '../pages/AccessControlPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import {
  pageTransitionVariants,
  pageReducedMotionVariants,
  usePrefersReducedMotion
} from '../utils/motion.js'

function PageWrapper({ children }) {
  const prefersReduced = usePrefersReducedMotion()
  return (
    <motion.div
      variants={prefersReduced ? pageReducedMotionVariants : pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageWrapper>
            <LandingPage />
          </PageWrapper>
        }
      />
      <Route
        path="/login"
        element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        }
      />
        <Route
          path="/dashboard"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/congestion"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <CongestionPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/routing"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <RoutingPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/berths"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <BerthPlannerPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/vessels"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <VesselTrackingPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/gates"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <GateControllerPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/cascade"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <EventCascadePage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/simulation"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <SimulationPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/plan"
          element={
            <PageWrapper>
              <ProtectedRoute requiredPermission="viewPlan">
                <PlanPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/alerts"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/access-control"
          element={
            <PageWrapper>
              <ProtectedRoute requiredPermission="manageUsers">
                <AccessControlPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
      </Routes>
  )
}
