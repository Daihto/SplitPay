import React from "react";
import { useNavigate } from "react-router-dom";

function BackButton({ fallback = "/dashboard" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // If there is a history entry we can go back to, use it.
    // Otherwise, fall back to a safe default route.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button className="back-btn" onClick={handleBack} type="button" aria-label="Go back">
      <span className="back-btn-icon" aria-hidden="true">‹</span>
      <span className="back-btn-label">Back</span>
    </button>
  );
}

export default BackButton;
