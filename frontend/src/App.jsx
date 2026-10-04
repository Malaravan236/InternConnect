import { BrowserRouter, Route, Routes } from "react-router-dom";
import authRoutes from "./routes/auth.routes";
import SuspenseLayout from "./layouts/SuspenseLayout";
import MainLayout from "./layouts/MainLayout";
import { RefreshProvider } from "../src/pages/RefreshContext";
function App() {
  return <RefreshProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SuspenseLayout />}>
            <Route element={<MainLayout />}>
              {authRoutes.navigationRouts.map((data) => <Route
    path={data.path}
    key={data.name}
    element={data.component}
  />)}
            </Route>
           
          </Route>
        </Routes>
      </BrowserRouter>
    </RefreshProvider>;
}
export default App;
