// components/ProtectedRoute.js
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  let router = useRouter();
  let path = usePathname();
  const auth = localStorage.getItem("accessToken");
  let isAuthenticated = auth || false;
  useEffect(() => {
    // Your authentication check logic here
    if (
      !isAuthenticated &&
      path != "/" &&
      path != "/forgot" &&
      path != "/terms" &&
      path != "/privacy"
    ) {
      router.replace("/"); // Redirect to login page or any other route
    }

    if (isAuthenticated && path == "/") {
      router.replace("/dashboard"); // Redirect to login page or any other route
    }
    if (allowedRoles.length > 0) {
      const userRoleStr = localStorage.getItem("user");
      const userRole = JSON.parse(userRoleStr);
      const roles = userRole?.role ? JSON.parse(userRole.role) : [];
      if (
        !roles.some((role) =>
          allowedRoles.some(
            (allowedRole) => role.toLowerCase() === allowedRole.toLowerCase()
          )
        )
      ) {
        router.replace("/"); // Redirect to an unauthorized page or any other route
      }
    }
  }, [router, allowedRoles, path, isAuthenticated]);

  return <>{children}</>;
};

export default ProtectedRoute;
