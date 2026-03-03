import { useCallback, useEffect, useRef, useState } from 'react';
import { useElementActions } from '@/hooks/ElementActionsContext';
import type { ElementNode } from '@/types/elements';
import './ElementActionsMenu.scss';

interface ElementActionsMenuProps {
    readonly element: ElementNode;
}

export default function ElementActionsMenu({ element }: ElementActionsMenuProps) {
    const { deleteElement, duplicateElement } = useElementActions();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

    const handleEdit = useCallback(() => {
        setIsOpen(false);
        // SilverStripe block edit routes expect to open the form in the main view or a modal,
        // Since we don't have a specific modal component currently, we'll open it in the same tab.
        if (element.blockSchema.actions?.edit) {
            window.location.href = element.blockSchema.actions.edit;
        }
    }, [element.blockSchema.actions?.edit]);

    const handleDuplicate = useCallback(() => {
        setIsOpen(false);
        if (element.canCreate) {
            duplicateElement(element.id);
        }
    }, [duplicateElement, element.id, element.canCreate]);

    const handleDelete = useCallback(() => {
        setIsOpen(false);
        if (!element.canDelete) return;

        if (window.confirm(`Are you sure you want to delete "${element.title}"?`)) {
            deleteElement(element.id);
        }
    }, [deleteElement, element.id, element.canDelete, element.title]);

    return (
        <div className="element-actions" ref={containerRef} data-testid="element-actions">
            <button
                type="button"
                className="element-actions__toggle"
                onClick={toggleOpen}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Actions"
                data-testid="element-actions-toggle"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
            </button>

            {isOpen && (
                <div className="element-actions__menu" role="menu">
                    {element.blockSchema.actions?.edit && (
                        <button type="button" className="element-actions__item" role="menuitem" onClick={handleEdit}>
                            Edit
                        </button>
                    )}

                    {element.canCreate && (
                        <button type="button" className="element-actions__item" role="menuitem" onClick={handleDuplicate}>
                            Duplicate
                        </button>
                    )}

                    {element.canDelete && (
                        <>
                            <div className="element-actions__divider" role="separator" />
                            <button
                                type="button"
                                className="element-actions__item element-actions__item--danger"
                                role="menuitem"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
