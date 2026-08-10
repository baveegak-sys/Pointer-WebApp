import { Routes, Route } from "react-router-dom";

import ParentDashboardHomePage from "../pages/parents/./ParentDashboardHome";


const ParentLayout = () => {

  return (
    <Routes>

      <Route
        path="/"
        element={<ParentDashboardHomePage />}
      />

    </Routes>
  );
};


export default ParentLayout;