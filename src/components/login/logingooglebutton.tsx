import React from "react";
import GoogleIcon from '@mui/icons-material/Google';

interface GoogleLoginButtonProps {
  onGoogleClick: () => void;
}

export default function GoogleLoginButton({ onGoogleClick }: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onGoogleClick}
      className="w-full flex items-center justify-center gap-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
    >
      <GoogleIcon style={{ fontSize: 18 }} className="text-red-500" />
      Sign in with Google
    </button>
  );
}