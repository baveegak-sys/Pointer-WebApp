import { Routes, Route } from "react-router-dom";

import Home from "../pages/parents/Home";


const ParentLayout = () => {

  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

    </Routes>
  );
};


export default ParentLayout;