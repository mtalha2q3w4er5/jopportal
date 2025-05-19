import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div>
      <h1>Welcome to MatchIn</h1>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  )
}

export default HomePage
