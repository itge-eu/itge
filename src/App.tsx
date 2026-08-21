import { Route, Routes } from "react-router"

import Layout from "./components/Layout"

import RequireAdmin from "./components/admin/RequireAdmin"

import AdminLoginPage from "./pages/AdminLoginPage"
import AdminPage from "./pages/AdminPage"
import AdminMediaPage from "./pages/AdminMediaPage"

import ImportReviewPage from "./pages/ImportReviewPage"
import AdminEditReviewPage from "./pages/AdminEditReviewPage"
import AdminReviewsPage from "./pages/AdminReviewsPage"

import ImportImpressionPage from "./pages/ImportImpressionPage"
import AdminEditImpressionPage from "./pages/AdminEditImpressionPage"
import AdminImpressionsPage from "./pages/AdminImpressionsPage"

import HomePage from "./pages/HomePage"
import ReviewsPage from "./pages/ReviewsPage"
import ReviewPage from "./pages/ReviewPage"
import ReviewersPage from "./pages/ReviewersPage"
import ReviewerPage from "./pages/ReviewerPage"

import DiscoverPage from "./pages/DiscoverPage"
import IemPage from "./pages/IemPage"
import IemsPage from "./pages/IemsPage"
import ManufacturerPage from "./pages/ManufacturerPage"
import ManufacturersPage from "./pages/ManufacturersPage"
import ArtistsPage from "./pages/ArtistsPage"
import ArtistPage from "./pages/ArtistPage"
import GenresPage from "./pages/GenresPage"
import GenrePage from "./pages/GenrePage"
import NotFoundPage from "./pages/NotFoundPage"
import ImpressionsPage from "./pages/ImpressionsPage"
import ImpressionPage from "./pages/ImpressionPage"

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
		<Route path="/discover" element={<DiscoverPage />} />

        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/reviews/:slug" element={<ReviewPage />} />
		
		<Route path="/impressions" element={<ImpressionsPage />} />
		<Route path="/impressions/:slug" element={<ImpressionPage />} />
		
		<Route path="/iems" element={<IemsPage />} />
		<Route path="/iems/:slug" element={<IemPage />} />
		
		<Route path="/manufacturers" element={<ManufacturersPage />} />
		<Route path="/manufacturers/:slug" element={<ManufacturerPage />} />
		
        <Route path="/reviewers" element={<ReviewersPage />} />
        <Route path="/reviewers/:slug" element={<ReviewerPage />} />
		
		<Route path="/artists" element={<ArtistsPage />} />
		<Route path="/artists/:slug" element={<ArtistPage />} />
		
		<Route path="/genres" element={<GenresPage />} />
		<Route path="/genres/:slug" element={<GenrePage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminPage />} />
		  <Route path="/admin/media" element={<AdminMediaPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/reviews/:id/edit" element={<AdminEditReviewPage />} />
          <Route path="/admin/impressions" element={<AdminImpressionsPage />} />
          <Route path="/admin/impressions/:id/edit" element={<AdminEditImpressionPage />} />
          <Route path="/admin/import" element={<ImportReviewPage />} />
          <Route path="/admin/import-impression" element={<ImportImpressionPage />} />
        </Route>
		
		<Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App