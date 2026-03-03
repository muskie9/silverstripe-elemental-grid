import { useCallback, useEffect, useRef, useState } from 'react';
import { useElementActions } from '@/hooks/ElementActionsContext';
import ElementTypePicker from '@/components/ElementTypePicker/ElementTypePicker';
import './AddElementButton.scss';

interface AddElementButtonProps {
    /** The elemental area ID to create the new element in */
    readonly areaId: number;
    /** Map of PHP class → label for the types this container allows (null = any type) */
    readonly allowedTypes: Record<string, string> | null;
    /** Contextual label, e.g. "Add section", "Add row", "Add content block" */
    readonly label: string;
    /** Optional: insert after this element ID (for ordering) */
    readonly insertAfterElementID?: number;
}

/**
 * Button that triggers element creation. If only one type is allowed, creates
 * directly on click. If multiple types are allowed, shows a type picker dropdown.
 */
export default function AddElementButton({
    areaId,
    allowedTypes,
    label,
    insertAfterElementID,
}: AddElementButtonProps) {
    const { createElement } = useElementActions();
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const types = allowedTypes ?? {};
    const typeEntries = Object.entries(types);

    // Close picker on outside click
    useEffect(() => {
        if (!isPickerOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPickerOpen]);

    const handleClick = useCallback(() => {
        if (typeEntries.length === 0) {
            // No allowed types configured — nothing to do
            return;
        }

        if (typeEntries.length === 1) {
            // Only one type — create directly
            createElement({
                elementClass: typeEntries[0][0],
                elementalAreaID: areaId,
                insertAfterElementID,
            });
            return;
        }

        // Multiple types — show the picker
        setIsPickerOpen((prev) => !prev);
    }, [typeEntries, createElement, areaId, insertAfterElementID]);

    const handleTypeSelect = useCallback((elementClass: string) => {
        createElement({
            elementClass,
            elementalAreaID: areaId,
            insertAfterElementID,
        });
        setIsPickerOpen(false);
    }, [createElement, areaId, insertAfterElementID]);

    const handlePickerClose = useCallback(() => {
        setIsPickerOpen(false);
    }, []);

    if (typeEntries.length === 0) {
        return null;
    }

    return (
        <div className="add-element" ref={containerRef} data-testid="add-element">
            <button
                type="button"
                className="add-element__button"
                onClick={handleClick}
                aria-expanded={isPickerOpen}
                aria-haspopup={typeEntries.length > 1 ? 'listbox' : undefined}
                data-testid="add-element-button"
            >
                <span className="add-element__icon" aria-hidden="true">+</span>
                <span className="add-element__label">{label}</span>
            </button>
            {isPickerOpen && (
                <ElementTypePicker
                    allowedTypes={types}
                    onSelect={handleTypeSelect}
                    onClose={handlePickerClose}
                />
            )}
        </div>
    );
}
