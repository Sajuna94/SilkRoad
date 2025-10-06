import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <h1>Silkroad Website</h1>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{" "}
        <Link to="/product">Product Details</Link>
      </nav>
    </header>
  );
}
