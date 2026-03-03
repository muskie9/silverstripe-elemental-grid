import { useCallback } from 'react';
import { useElementActions } from '@/hooks/ElementActionsContext';
import type { ElementNode } from '@/types/elements';
import { getElementStatus } from '@/types/status';
import './PublishToggle.scss';

interface PublishToggleProps {
    readonly element: ElementNode;
}

export default function PublishToggle({ element }: PublishToggleProps) {
    const { publishElement, unpublishElement } = useElementActions();
    const status = getElementStatus(element.statusFlags);

    // Is this currently in a published state (no draft changes, and not added to draft)?
    const isPublished = status === 'published';
    const isDraft = status === 'draft';
    const isModified = status === 'modified';

    // Toggle state
    const isCurrentlyPublished = isPublished || isModified;

    const handleToggle = useCallback(() => {
        if (isCurrentlyPublished && element.canUnpublish) {
            unpublishElement(element.id);
        } else if (!isPublished && element.canPublish) {
            publishElement(element.id);
        }
    }, [
        isCurrentlyPublished,
        isPublished,
        element.id,
        element.canPublish,
        element.canUnpublish,
        publishElement,
        unpublishElement,
    ]);

    if (!element.canPublish && !element.canUnpublish) {
        return null;
    }

    return (
        <button
            type="button"
            className={`publish-toggle publish-toggle--${status}`}
            onClick={handleToggle}
            aria-pressed={isCurrentlyPublished}
            aria-label={isCurrentlyPublished ? 'Unpublish' : 'Publish'}
            data-testid="publish-toggle"
            title={isCurrentlyPublished ? 'Unpublish' : 'Publish'}
        >
            <div className="publish-toggle__track">
                <div className="publish-toggle__thumb" />
            </div>
        </button>
    );
}
