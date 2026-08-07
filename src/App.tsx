import { Route, Routes } from "react-router"

import Layout from "./components/Layout"

import HomePage from "./pages/HomePage"
import ReviewsPage from "./pages/ReviewsPage"
import ReviewPage from "./pages/ReviewPage"
import ReviewersPage from "./pages/ReviewersPage"
import ReviewerPage from "./pages/ReviewerPage"
import ImportReviewPage from "./pages/ImportReviewPage"
import AdminReviewsPage from "./pages/AdminReviewsPage"
import AdminEditReviewPage from "./pages/AdminEditReviewPage"
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

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
		<Route path="/discover" element={<DiscoverPage />} />

        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/reviews/:slug" element={<ReviewPage />} />
		
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

        <Route path="/admin/import" element={<ImportReviewPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/reviews/:id/edit" element={<AdminEditReviewPage />} />
		
		<Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App