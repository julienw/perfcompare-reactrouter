import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./routes/root";
import { Home } from "./routes/home";
import {
  CompareResults,
  loader as compareLoader,
} from "./routes/compare-results";
import { loader as recentRevisionsLoader } from "./routes/recent-revisions";
import { ErrorPage } from "./error-page";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/compare-results",
          element: <CompareResults />,
          loader: compareLoader,
        },
      ],
    },
    {
      path: "/api/recent-revisions/:repository",
      loader: recentRevisionsLoader,
      children: [
        {
          path: "by-author/:author",
          loader: recentRevisionsLoader,
        },
        {
          path: "by-hash/:hash",
          loader: recentRevisionsLoader,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
