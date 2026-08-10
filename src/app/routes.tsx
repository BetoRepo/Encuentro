import { createBrowserRouter } from 'react-router-dom'
import { Root } from './components/Root'
import { Home, Inscripcion, Consultas, Perfil } from './pages'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root />,
      children: [
        { index: true, element: <Home /> },
        { path: 'consultas', element: <Consultas /> },
        { path: 'inscripcion', element: <Inscripcion /> },
        { path: 'perfil', element: <Perfil /> },
      ],
    },
  ],
  {
    // Force root basename so router always matches on deployed site
    basename: '/',
  }
)