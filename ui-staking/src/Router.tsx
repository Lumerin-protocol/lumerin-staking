import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Landing } from "./pages/landing/Landing.tsx";
import React from "react";
import { Stake } from "./pages/stake/Stake.tsx";
import { Pools } from "./pages/pools/Pools.tsx";
import { Pool } from "./pages/pool/Pool.tsx";

const Root = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="/pools" element={<Pools />} />
    <Route path="/pools/:poolId" element={<Pool />} />
    <Route path="/pools/:poolId/stake" element={<Stake />} />
  </>
);

const router = createBrowserRouter(createRoutesFromElements(Root));

export const Router = () => {
  return (
    <React.Suspense fallback={<>Loading...</>}>
      <div className="lens" />
      <div className="page-content">
        <RouterProvider router={router} />
      </div>
    </React.Suspense>
  );
};
