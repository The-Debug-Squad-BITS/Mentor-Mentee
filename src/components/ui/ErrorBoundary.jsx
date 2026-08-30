import { Component } from "react";
import Brand from "./Brand";
import Button from "./Button";
import { AlertTriangle, Refresh, ArrowLeft } from "./Icons";

/* ==========================================================================
   ErrorBoundary
   --------------------------------------------------------------------------
   Without one of these, a single render-time throw anywhere in the tree
   unmounts the whole app and leaves a blank white page with no way back. This
   catches that, keeps the brand on screen and offers the two things that
   actually recover the session: retry the render, or go home.

   It only catches render/lifecycle errors — not rejected promises inside event
   handlers, which the API layer and per-screen catch blocks already handle.
   ========================================================================== */

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the component stack — React's own message alone rarely says where.
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas font-sans p-6">
        <Brand size="lg" className="mb-6" />

        <div className="card w-full max-w-md p-8 text-center sm:p-10">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-danger-200 bg-danger-50 text-danger-600">
            <AlertTriangle size={22} />
          </span>

          <h1 className="m-0 mt-5 font-display text-xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-slate-600">
            This screen hit an unexpected error. Your work is not lost — try loading it
            again, or head back to the dashboard.
          </p>

          {import.meta.env.DEV && (
            <pre className="mt-5 max-h-40 overflow-auto rounded-lg bg-slate-900 p-3 text-left text-[11px] leading-relaxed text-slate-200">
              {error?.stack || String(error)}
            </pre>
          )}

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={this.handleRetry}>
              <Refresh size={16} />
              Try again
            </Button>
            <Button variant="secondary" onClick={() => { window.location.href = "/"; }}>
              <ArrowLeft size={16} />
              Back to start
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
