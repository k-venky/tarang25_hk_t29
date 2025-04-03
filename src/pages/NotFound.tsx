
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage/10 to-lavender/10 p-4">
      <div className="card-mental max-w-md w-full text-center p-8">
        <div className="bg-lavender/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-lavender" />
        </div>
        <h1 className="text-4xl font-poppins font-semibold mb-4 text-sage">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          We couldn't find the page you're looking for
        </p>
        <Button 
          className="bg-sage hover:bg-sage/90 text-white"
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
