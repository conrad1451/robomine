// src/auth/LoginModal.tsx

// CHQ: Claude AI (Sonnet) generated this file

import { Descope } from "@descope/react-sdk";

export function LoginModal(props: { onClose: () => void }) {
  const { onClose } = props;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-yellow-500/40 rounded-lg p-6 max-w-sm w-full"
        // Prevent clicks inside the modal from closing it
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-yellow-400">Log In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/*
          "sign-up-or-in" is Descope's default flow ID for a combined
          sign-up/sign-in form. Swap this for a custom flow ID configured
          in the Descope console if you set one up.
        */}
        <Descope
          flowId="sign-up-or-in"
          onSuccess={onClose}
          onError={(err) => console.error("Descope auth error:", err)}
        />
      </div>
    </div>
  );
}
