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

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
		<Route
          path="/discover"
          element={<DiscoverPage />}
        />

        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/reviews/:slug" element={<ReviewPage />} />
		
		<Route path="/iems" element={<IemsPage />} />
		<Route path="/iems/:slug" element={<IemPage />} />

        <Route path="/reviewers" element={<ReviewersPage />} />
        <Route path="/reviewers/:slug" element={<ReviewerPage />} />

        <Route path="/admin/import" element={<ImportReviewPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route
          path="/admin/reviews/:id/edit"
          element={<AdminEditReviewPage />}
        />
		      </Route>
    </Routes>
  )
}

export default App