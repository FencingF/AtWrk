import {Outlet, Link} from "react-router-dom";
import {useAuthentication} from "./services/authservice.js";
import {SignIn, SignOut} from "./utils/AuthButtons.jsx";

export default function Layout() {

    const user = useAuthentication();

    return (
        <div className="App">
            <header className="header">
                <div className="leftGroup">
                    <Link to="/" className="logoLink"><h1 className="logoText">AtWrk</h1></Link>
                    <Link to="/strength"><button className="stdBtn stdBtn-page">Strength</button></Link>
                    <Link to="/workouts"><button className="stdBtn stdBtn-page">Workouts</button></Link>
                    {/*<Link to="/other"><button className="stdBtn stdBtn-page">Other</button></Link>*/}
                </div>
                {!user ? <SignIn /> : <SignOut />}
            </header>

            <main className="main">
                {/* The current route's component will render here */}
                <Outlet />
            </main>

            <footer className="footer">
                {/* persistent footer if you want */}
            </footer>
        </div>
    );
}
