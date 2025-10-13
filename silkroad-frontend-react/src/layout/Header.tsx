import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
	return (
		<header className="navbar">
			<div className="navbar-logo">
				<Link to="/">SilkRoad</Link>
			</div>
			<nav className="navbar-links">
				<Link to="/">Home</Link>
				<Link to="/about">About</Link>
				<Link to="/login">Login</Link>
			</nav>
		</header>
	);
}
