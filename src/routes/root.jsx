import { Outlet, Link } from "react-router-dom";
export function Root() {
  return (
    <>
      <h1>
        <Link to="/">Perf compare</Link>
      </h1>
      <button>Toggle dark mode</button>
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
