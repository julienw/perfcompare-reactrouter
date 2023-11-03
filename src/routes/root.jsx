import { Outlet } from "react-router-dom";
export function Root() {
  return (
    <>
      <h1>Perf compare</h1>
      <button>Toggle dark mode</button>
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
