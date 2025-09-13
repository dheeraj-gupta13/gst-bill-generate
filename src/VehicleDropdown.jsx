import React, { useState } from "react";
import "./VehicleDropdown.css";

export default function VehicleDropdown({ value, onChange, options }) {
    const [search, setSearch] = useState("");
    const [showOptions, setShowOptions] = useState(false);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (val) => {
        onChange(val);
        setSearch("");
        setShowOptions(false);
    };

    return (
        <div className="dropdown-container">
            <input
                type="text"
                placeholder="Vehicle No."
                value={search || value}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShowOptions(true);
                }}
                onFocus={() => setShowOptions(true)}
                className="dropdown-input"
                autoComplete="off"
            />
            {showOptions && filteredOptions.length > 0 && (
                <ul className="dropdown-options">
                    {filteredOptions.map((opt, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
