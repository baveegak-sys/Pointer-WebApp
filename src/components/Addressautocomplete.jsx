import React, { useEffect, useRef, useState } from "react";

// LocationIQ: free tier (5,000 req/day, 2 req/sec), needs an API key from
// https://locationiq.com — restrict it to your app's domain(s) under
// Account > API Access since it's visible client-side.
//
// Nominatim and Photon are kept here as free, key-free fallbacks in case
// you want to switch providers later without touching the rest of your code.

const PROVIDERS = {
    locationiq: {
        requiresKey: true,
        buildUrl: (query, apiKey) => {
            const params = new URLSearchParams({
                key: apiKey,
                q: query,
                format: "json",
                countrycodes: "au",
                limit: "8",
                addressdetails: "1",
                normalizecity: "1",
            });
            return `https://api.locationiq.com/v1/autocomplete?${params.toString()}`;
        },
        parseResults: (data) =>
            (Array.isArray(data) ? data : [])
                .filter((r) => (r.address?.country_code || "").toUpperCase() === "AU")
                .map((r) => ({
                    id: r.place_id,
                    label: r.display_name,
                    lat: parseFloat(r.lat),
                    lon: parseFloat(r.lon),
                })),
        debounceMs: 300,
    },
    nominatim: {
        requiresKey: false,
        buildUrl: (query) => {
            const params = new URLSearchParams({
                q: query,
                format: "jsonv2",
                addressdetails: "1",
                countrycodes: "au",
                limit: "8",
                email: "support@example.com", // replace with a real contact address
            });
            return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        },
        parseResults: (data) =>
            (data || [])
                .filter((r) => (r.address?.country_code || "").toUpperCase() === "AU")
                .map((r) => ({
                    id: r.place_id,
                    label: r.display_name,
                    lat: parseFloat(r.lat),
                    lon: parseFloat(r.lon),
                })),
        debounceMs: 700,
    },
    photon: {
        requiresKey: false,
        buildUrl: (query) => {
            const params = new URLSearchParams({
                q: query,
                limit: "8",
                lang: "en",
                bbox: "112.0,-44.0,154.5,-9.0",
            });
            return `https://photon.komoot.io/api/?${params.toString()}`;
        },
        parseResults: (data) =>
            (data?.features || [])
                .filter((f) => (f.properties?.countrycode || "").toUpperCase() === "AU")
                .map((f) => {
                    const p = f.properties || {};
                    const parts = [p.name, p.street, p.city, p.state, p.postcode].filter(Boolean);
                    return {
                        id: `${f.geometry?.coordinates?.[0]}-${f.geometry?.coordinates?.[1]}-${p.osm_id}`,
                        label: [...new Set(parts)].join(", ") || p.name || "Unnamed location",
                        lat: f.geometry?.coordinates?.[1],
                        lon: f.geometry?.coordinates?.[0],
                    };
                }),
        debounceMs: 350,
    },
};

const MIN_CHARS = 3;

const AddressAutocomplete = ({
                                 value,
                                 onChange,
                                 onSelect,
                                 placeholder,
                                 disabled,
                                 autoFocus,
                                 provider = "locationiq", // "locationiq" | "nominatim" | "photon"
                                 apiKey, // required when provider === "locationiq"
                             }) => {
    const config = PROVIDERS[provider] || PROVIDERS.locationiq;

    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [providerError, setProviderError] = useState("");

    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value || value.trim().length < MIN_CHARS) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        if (config.requiresKey && !apiKey) {
            setProviderError("Address lookup isn't configured (missing API key).");
            return;
        }

        debounceRef.current = setTimeout(() => {
            fetchSuggestions(value.trim());
        }, config.debounceMs);

        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, provider, apiKey]);

    const fetchSuggestions = async (query) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setProviderError("");

        try {
            const res = await fetch(config.buildUrl(query, apiKey), { signal: controller.signal });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Address lookup key is invalid or restricted for this domain.");
                }
                if (res.status === 429) {
                    throw new Error("Address lookup rate limit reached, try again shortly.");
                }
                throw new Error(`Address lookup failed (${res.status}).`);
            }

            const data = await res.json();
            const parsed = config.parseResults(data);

            setSuggestions(parsed);
            setOpen(true);
            setHighlightedIndex(-1);
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error(`Address autocomplete error (${provider}):`, err);
                setSuggestions([]);
                setProviderError(err.message || "Address lookup is temporarily unavailable.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (suggestion) => {
        onChange(suggestion.label);
        onSelect?.(suggestion);
        setSuggestions([]);
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter") {
            if (highlightedIndex >= 0) {
                e.preventDefault();
                handleSelect(suggestions[highlightedIndex]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="location-autocomplete" ref={wrapperRef}>
            <input
                type="text"
                className="location-input"
                placeholder={placeholder || "Start typing an address…"}
                value={value}
                disabled={disabled}
                autoFocus={autoFocus}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => value?.trim().length >= MIN_CHARS && setOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />

            {loading && <div className="location-autocomplete-loading">Searching…</div>}

            {providerError && (
                <div className="location-autocomplete-empty">{providerError}</div>
            )}

            {open && suggestions.length > 0 && (
                <ul className="location-suggestions">
                    {suggestions.map((s, index) => (
                        <li
                            key={s.id}
                            className={`location-suggestion${
                                index === highlightedIndex ? " is-highlighted" : ""
                            }`}
                            onMouseDown={() => handleSelect(s)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {s.label}
                        </li>
                    ))}
                </ul>
            )}

            {open &&
                !loading &&
                !providerError &&
                suggestions.length === 0 &&
                value?.trim().length >= MIN_CHARS && (
                    <div className="location-autocomplete-empty">
                        No matching Australian addresses found.
                    </div>
                )}
        </div>
    );
};

export default AddressAutocomplete;