import { Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import ReviewPage from "./pages/ReviewPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reviews/:slug" element={<ReviewPage />} />
    </Routes>
  )
}

export default App