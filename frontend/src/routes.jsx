import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import DepartmentDashboard from "./components/DepartmentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "*",
        element: <Login />
    },
    {
        path: "/admin/home",
        element: <ProtectedRoute><Home /></ProtectedRoute>
    },
    {
        path: "/admin/departments/:departmentId",
        element: <ProtectedRoute><DepartmentDashboard /></ProtectedRoute>
    }
]);

export default router;
