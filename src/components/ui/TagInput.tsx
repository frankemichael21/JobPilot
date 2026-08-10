"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [entwurf, setEntwurf] = useState("");

  function hinzufuegen() {
    const wert = entwurf.trim();
    if (wert.length === 0 || values.includes(wert)) {
      setEntwurf("");
      return;
    }
    onChange([...values, wert]);
    setEntwurf("");
  }

  function entfernen(wert: string) {
    onChange(values.filter((v) => v !== wert));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((wert) => (
          <span
            key={wert}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-700"
          >
            {wert}
            <button
              type="button"
              onClick={() => entfernen(wert)}
              aria-label={`${wert} entfernen`}
              className="text-navy-700/60 hover:text-navy-900"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={entwurf}
          onChange={(e) => setEntwurf(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              hinzufuegen();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        <button
          type="button"
          onClick={hinzufuegen}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800"
        >
          <Plus size={14} aria-hidden="true" />
          Hinzufügen
        </button>
      </div>
    </div>
  );
}
