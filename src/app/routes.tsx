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
        {
          basename: (() => {
            const raw = import.meta.env.BASE_URL ?? '/'
            const cleaned = String(raw).replace(/\\/g, '/').replace(/(^\.?\/+|\/+$/g, '')
            return cleaned ? `/${cleaned}` : '/'
          })(),
        }
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