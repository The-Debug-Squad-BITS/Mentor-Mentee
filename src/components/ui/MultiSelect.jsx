/* ==========================================================================
   MultiSelect — a dropdown for picking several people at once.
   --------------------------------------------------------------------------
   Written to sit beside a native <select> without looking foreign: the closed
   trigger reuses `.select-field` verbatim, so a "choose one supervisor"
   dropdown and a "choose several students" dropdown are the same control to
   look at. Only the open panel is custom, because a native <select multiple>
   renders as an always-open scrolling box — the thing this replaces.

   The list stays collapsed until asked for, which is the point: an inline
   checkbox column grows with the number of people in the department and pushes
   the rest of the form down the page.

   Props
     options         array of records to choose from
     value           array of selected values (ids) — controlled
     onChange        (nextValue: array) => void
     getOptionValue  record => value        (default: o._id)
     getOptionLabel  record => string       (default: o.name)
     getOptionMeta   record => string|null  (default: o.email) — dimmed, right-aligned
     placeholder     shown when nothing is selected
     noun/nounPlural used to summarise a selection ("3 students selected")
     loading         renders a loading row instead of the list
     error           renders an error row instead of the list
     onRetry         adds a Retry action to the error row
     emptyMessage    shown when there are no options at all
     disabled        disables the trigger
     id              id for the trigger, so an external <label> can point at it

   Keyboard: Enter/Space/ArrowDown opens, arrows move, Enter/Space toggles,
   Escape closes and returns focus, Tab closes. The panel is a listbox and
   reports its multi-selectable state to assistive technology.
   ========================================================================== */

import { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import { ChevronDown, Check, Search } from "./Icons";

const SEARCH_THRESHOLD = 7; // below this a filter box is just clutter

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  getOptionValue = (o) => o._id,
  getOptionLabel = (o) => o.name,
  getOptionMeta = (o) => o.email,
  placeholder = "Select…",
  noun = "item",
  nounPlural,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "Nothing to choose from.",
  disabled = false,
  id,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  /* Two of the three places this is used sit at the bottom of a scrolling
     modal panel, which clips its own overflow — a panel that always dropped
     downwards would be cut in half there. */
  const [dropUp, setDropUp] = useState(false);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const reactId = useId();
  const triggerId = id || `ms-${reactId}`;
  const listId = `${triggerId}-list`;

  const plural = nounPlural || `${noun}s`;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const label = String(getOptionLabel(o) ?? "");
      const meta = String(getOptionMeta(o) ?? "");
      return label.toLowerCase().includes(q) || meta.toLowerCase().includes(q);
    });
  }, [options, query, getOptionLabel, getOptionMeta]);

  const selectedRecords = useMemo(
    () => options.filter((o) => value.includes(getOptionValue(o))),
    [options, value, getOptionValue]
  );

  /* A selection made before the options finished loading must still be
     summarised, so fall back to the raw count rather than showing the
     placeholder as though nothing were selected. */
  const summary = useMemo(() => {
    if (value.length === 0) return null;
    if (selectedRecords.length === 0) {
      return `${value.length} selected`;
    }
    if (selectedRecords.length === 1) return String(getOptionLabel(selectedRecords[0]) ?? "1 selected");
    if (selectedRecords.length === 2) {
      return selectedRecords.map((o) => getOptionLabel(o)).join(", ");
    }
    return `${selectedRecords.length} ${plural} selected`;
  }, [value, selectedRecords, getOptionLabel, plural]);

  const close = useCallback((refocus = false) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    if (refocus && triggerRef.current) triggerRef.current.focus();
  }, []);

  // ── Close on outside click and on Escape anywhere ────────────────────────
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, close]);

  // Focus the filter as soon as the panel opens, when there is one.
  useEffect(() => {
    if (open && options.length >= SEARCH_THRESHOLD && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, options.length]);

  /* Clamped during render rather than corrected in an effect: filtering can
     shrink the list under the cursor, and re-rendering to fix that would be a
     wasted pass. */
  const active = activeIndex >= visible.length ? visible.length - 1 : activeIndex;

  const toggle = (optionValue) => {
    if (!onChange) return;
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const move = (delta) => {
    if (visible.length === 0) return;
    setActiveIndex((i) => {
      const next = i < 0 ? (delta > 0 ? 0 : visible.length - 1) : (i + delta + visible.length) % visible.length;
      const row = listRef.current?.children?.[next];
      if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
      return next;
    });
  };

  /* Measured against whichever ancestor actually clips — the modal panel when
     there is one, the viewport otherwise. */
  const openPanel = () => {
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const clipper = trigger.closest(".modal-panel");
      const bottomEdge = clipper ? clipper.getBoundingClientRect().bottom : window.innerHeight;
      const topEdge = clipper ? clipper.getBoundingClientRect().top : 0;
      const PANEL = 300; // max-h-56 list + search + footer, roughly
      setDropUp(bottomEdge - rect.bottom < PANEL && rect.top - topEdge > bottomEdge - rect.bottom);
    }
    setOpen(true);
  };

  const onTriggerKeyDown = (e) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openPanel();
    }
  };

  const onPanelKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); }
    else if (e.key === "End") { e.preventDefault(); setActiveIndex(visible.length - 1); }
    else if (e.key === "Enter" || (e.key === " " && e.target.tagName !== "INPUT")) {
      if (active >= 0 && visible[active]) {
        e.preventDefault();
        toggle(getOptionValue(visible[active]));
      }
    } else if (e.key === "Tab") {
      close();
    }
  };

  const allVisibleSelected =
    visible.length > 0 && visible.every((o) => value.includes(getOptionValue(o)));

  const selectAllVisible = () => {
    if (!onChange) return;
    const ids = visible.map(getOptionValue);
    onChange(allVisibleSelected ? value.filter((v) => !ids.includes(v)) : [...new Set([...value, ...ids])]);
  };

  const triggerDisabled = disabled || loading || (!!error && options.length === 0);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={triggerDisabled}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className="select-field relative text-left cursor-pointer disabled:cursor-not-allowed"
        style={{ backgroundImage: "none" }}
      >
        <span className={`block truncate pr-1 ${summary ? "text-slate-900" : "text-slate-400"}`}>
          {loading ? "Loading…" : error && options.length === 0 ? "Unavailable" : summary || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Loading and error live outside the panel so they are visible while the
          control is collapsed — a silent empty dropdown is indistinguishable
          from a department with no students in it. */}
      {loading && <p className="field-hint">Loading {plural}…</p>}

      {!loading && error && (
        <p className="field-error">
          {error}{" "}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline font-semibold bg-transparent border-0 p-0 cursor-pointer text-danger-700"
            >
              Retry
            </button>
          )}
        </p>
      )}

      {open && (
        <div
          onKeyDown={onPanelKeyDown}
          className={`absolute z-50 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden ${dropUp ? "bottom-full mb-1.5" : "mt-1.5"}`}
        >
          {options.length >= SEARCH_THRESHOLD && (
            <div className="relative border-b border-slate-100 p-2">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                placeholder={`Search ${plural}…`}
                aria-label={`Search ${plural}`}
                className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg border border-slate-200 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 transition-[border-color,box-shadow] duration-150"
              />
            </div>
          )}

          {options.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-slate-500">{emptyMessage}</p>
          ) : visible.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-slate-500">No match for “{query}”.</p>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={triggerId}
              tabIndex={-1}
              className="max-h-56 overflow-y-auto py-1 m-0 list-none"
            >
              {visible.map((o, i) => {
                const v = getOptionValue(o);
                const selected = value.includes(v);
                const meta = getOptionMeta(o);
                return (
                  <li
                    key={v}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(v)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                      i === active ? "bg-brand-50" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex items-center justify-center w-4 h-4 shrink-0 rounded border transition-colors ${
                        selected
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {selected && <Check size={11} />}
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {getOptionLabel(o)}
                    </span>
                    {meta && (
                      <span className="text-xs text-slate-500 ml-auto truncate max-w-[45%]">{meta}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {options.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 bg-slate-50">
              <span className="text-[12px] text-slate-500">
                {value.length === 0 ? `No ${plural} selected` : `${value.length} selected`}
              </span>
              <div className="flex items-center gap-3">
                {visible.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="text-[12px] font-semibold text-brand-700 hover:text-brand-800 bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {allVisibleSelected ? "Clear these" : "Select all"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => close(true)}
                  className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 bg-transparent border-0 p-0 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* The chosen people stay readable while the panel is shut. Removing one
          from here is the fastest way to correct a mis-click. */}
      {!open && selectedRecords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedRecords.map((o) => {
            const v = getOptionValue(o);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-brand-50 border border-brand-100 text-[12px] font-medium text-brand-700"
              >
                {getOptionLabel(o)}
                <button
                  type="button"
                  aria-label={`Remove ${getOptionLabel(o)}`}
                  onClick={() => toggle(v)}
                  disabled={disabled}
                  className="flex items-center justify-center w-4 h-4 rounded bg-transparent border-0 p-0 cursor-pointer text-brand-500 hover:text-brand-800 hover:bg-brand-100 disabled:cursor-not-allowed"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Reported to assistive technology only — the visible summary is in the
          trigger, but a screen reader needs the change announced. */}
      <span className="sr-only" aria-live="polite">
        {value.length} {value.length === 1 ? noun : plural} selected
      </span>
    </div>
  );
}
