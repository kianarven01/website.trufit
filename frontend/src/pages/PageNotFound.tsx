import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      
      {/* 404 Text */}
      <h1 className="text-6xl font-bold text-blue-900">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mt-2 text-gray-500 max-w-md">
        The page you are looking for might have been removed,
        had its name changed, or is temporarily unavailable.
      </p>

      {/* Button */}
      <Button
        className="mt-6 bg-blue-900 hover:bg-blue-800"
        onClick={() => navigate(-1)}
      >
        Return
      </Button>

    </div>
  );
};

export default PageNotFound;