import "./Login.css";

function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">StrayCare - Street Animal Tracking App</h1>
        <p className="subtitle">Admin & User Login</p>

        <form className="login-form">
          <input
            type="email"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            placeholder="Password"
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="footer-text">
          © 2025 StrayCare. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
