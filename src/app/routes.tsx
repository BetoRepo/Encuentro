import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { Home, Inscripcion, Conocenos, Consultas } from "./pages";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />, 
      children: [
        { 
          index: true, 
          element: <Home /> 
        },
        { 
          path: "conocenos", 
          element: <Conocenos /> 
        },
        { 
          path: "consultas", 
          element: <Consultas /> 
        },
        { 
          path: "inscripcion", 
          element: <Inscripcion /> 
        },
      ],
      {
        basename:
          import.meta.env.BASE_URL && import.meta.env.BASE_URL !== './'
            ? import.meta.env.BASE_URL
            : '/',
      }
    basename: import.meta.env.BASE_URL,
  }
);