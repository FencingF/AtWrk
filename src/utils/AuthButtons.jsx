import { login, logout, loggedInUserDisplayName } from "../services/authService"

export function SignIn() {
    return (
        <div>
            <button className={"stdBtn stdBtn-signIn"} onClick={login}>Sign In</button>
        </div>
    )
}


export function SignOut() {
    return (
        <div>
            {/*Hello, {loggedInUserDisplayName()}*/}
            <button className={"stdBtn stdBtn-signOut"} onClick={logout}>Sign Out</button>
        </div>
    )
}

