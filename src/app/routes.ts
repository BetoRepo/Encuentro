import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home, Inscripcion, Conocenos } from "./pages";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Root,
      children: [
        { index: true, Component: Home },
        { path: "conocenos", Component: Conocenos },
        { path: "inscripcion", Component: Inscripcion },
      ],
    },
  ],
  {
    basename: "/Encuentro",
  }
);
