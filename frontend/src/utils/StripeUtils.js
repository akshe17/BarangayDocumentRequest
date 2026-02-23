import { loadStripe } from "@stripe/stripe-js";

// IMPORTANT: Must use PUBLISHABLE key (pk_test_...), never the secret key (sk_test_...)
// Set VITE_STRIPE_PUBLIC_KEY in your .env file to your pk_test_... key
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ??
    "pk_test_51T3u1D4mHtpmZNObriF5WygpZhoMElmK0sE7VTfRTNZN8466eSzzmux07dQvrAmGZKGkJoYD4ayR6enRYsnzEYrK00UWJQqsCA",
);
