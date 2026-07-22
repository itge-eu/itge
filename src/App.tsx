import { Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import ImportReviewPage from "./pages/ImportReviewPage"
import ReviewPage from "./pages/ReviewPage"
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminEditReviewPage from "./pages/AdminEditReviewPage";
import ReviewsPage from "./pages/ReviewsPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>  
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reviews/:slug" element={<ReviewPage />} />
        <Route path="/admin/import" element={<ImportReviewPage />} />
	    <Route path="/admin/reviews" element={<AdminReviewsPage />} />
	    <Route
          path="/admin/reviews/:id/edit"
          element={<AdminEditReviewPage />}
        />
	    <Route
          path="/reviews"
          element={<ReviewsPage />}
        />
      </Routes>
	</>
  )
}

export default App