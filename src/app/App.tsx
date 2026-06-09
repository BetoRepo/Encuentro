import { RouterProvider } from "react-router-dom"; // 👈 Cambiado a 'react-router-dom'
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}
