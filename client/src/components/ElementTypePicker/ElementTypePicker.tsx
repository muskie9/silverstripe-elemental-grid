import { useEffect, useRef, useState } from 'react';

interface ElementTypePickerProps {
    /** Map of PHP class name → human-readable label for each allowed type */
    readonly allowedTypes: Record<string, string>;
    /** Called when the user selects a type */
    readonly onSelect: (elementClass: string) => void;
    /** Called when the picker should close (Escape key or outside click) */
    readonly onClose: () => void;
}

/**
 * Dropdown list of element types for the user to choose from.
 * Supports keyboard navigation: Arrow keys move focus, Enter selects, Escape closes.
 */
export default function ElementTypePicker({
    allowedTypes,
    onSelect,
    onClose,
}: ElementTypePickerProps) {
    const entries = Object.entries(allowedTypes);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        // Focus the list container on mount so keyboard events are captured
        listRef.current?.focus();
    }, []);

    function handleKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex((prev) => (prev + 1) % entries.length);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex((prev) => (prev - 1 + entries.length) % entries.length);
                break;
            case 'Enter':
                event.preventDefault();
                onSelect(entries[focusedIndex][0]);
                break;
            case 'Escape':
                event.preventDefault();
                onClose();
                break;
        }
    }

    return (
        <ul
            ref={listRef}
            className="element-type-picker"
            role="listbox"
            aria-label="Select element type"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            data-testid="element-type-picker"
        >
            {entries.map(([className, label], index) => (
                <li
                    key={className}
                    role="option"
                    aria-selected={index === focusedIndex}
                    className={`element-type-picker__option${index === focusedIndex ? ' element-type-picker__option--focused' : ''}`}
                    onClick={() => onSelect(className)}
                    data-testid={`element-type-option-${index}`}
                >
                    {label}
                </li>
            ))}
        </ul>
    );
}
