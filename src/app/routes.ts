import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { Inscripcion } from "./pages/Inscripcion";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Root,
      children: [
        { index: true, Component: Home },
        { path: "inscripcion", Component: Inscripcion },
      ],
    },
  ],
  {
    basename: "/Encuentro",
  }
);
