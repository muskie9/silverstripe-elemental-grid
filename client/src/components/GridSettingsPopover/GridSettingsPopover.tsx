import { useState, useRef, useEffect, MouseEvent } from 'react';
import { useElementActions } from '@/hooks/ElementActionsContext';
import { useViewportContext } from '@/hooks/ViewportContext';
import { getColumnCount } from '@/utils/gridAdapter';
import type { EnrichedColumnNode } from '@/types/enriched';
import './GridSettingsPopover.scss';

interface GridSettingsPopoverProps {
    readonly column: EnrichedColumnNode;
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function GridSettingsPopover({
    column,
    isOpen,
    onClose,
    triggerRef,
}: GridSettingsPopoverProps) {
    const { activeViewport } = useViewportContext();
    const { updateGridSettings } = useElementActions();
    const columnCount = getColumnCount();
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentSettings = column.gridSettings[activeViewport] ?? {
        width: columnCount,
        offset: 0,
        visible: true,
    };

    const [width, setWidth] = useState(currentSettings.width);
    const [offset, setOffset] = useState(currentSettings.offset);
    const [visible, setVisible] = useState(currentSettings.visible);

    useEffect(() => {
        const fresh = column.gridSettings[activeViewport] ?? {
            width: columnCount,
            offset: 0,
            visible: true,
        };
        setWidth(fresh.width);
        setOffset(fresh.offset);
        setVisible(fresh.visible);
    }, [column.gridSettings, activeViewport, columnCount]);

    useEffect(() => {
        function handleClickOutside(event: globalThis.MouseEvent) {
            if (
                isOpen &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, triggerRef]);

    if (!isOpen) {
        return null;
    }

    const handleApply = (e: MouseEvent) => {
        e.preventDefault();
        updateGridSettings({
            id: column.id,
            viewport: activeViewport,
            width,
            offset,
            visible,
        });
        onClose();
    };

    return (
        <div className="grid-settings-popover" ref={popoverRef}>
            <div className="grid-settings-popover__header">
                <h4>Column Settings ({activeViewport})</h4>
            </div>
            <div className="grid-settings-popover__body">
                <label className="grid-settings-popover__field">
                    <span>Width</span>
                    <select value={width} onChange={(e) => setWidth(Number(e.target.value))}>
                        {Array.from({ length: columnCount }, (_, i) => i + 1).map((val) => (
                            <option key={val} value={val}>{val} / {columnCount}</option>
                        ))}
                    </select>
                </label>

                <label className="grid-settings-popover__field">
                    <span>Offset</span>
                    <select value={offset} onChange={(e) => setOffset(Number(e.target.value))}>
                        <option value={0}>No offset</option>
                        {Array.from({ length: columnCount - 1 }, (_, i) => i + 1).map((val) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </label>

                <label className="grid-settings-popover__field grid-settings-popover__field--checkbox">
                    <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => setVisible(e.target.checked)}
                    />
                    <span>Visible on {activeViewport}</span>
                </label>
            </div>
            <div className="grid-settings-popover__footer">
                <button type="button" className="btn btn-primary" onClick={handleApply}>
                    Apply
                </button>
            </div>
        </div>
    );
}
