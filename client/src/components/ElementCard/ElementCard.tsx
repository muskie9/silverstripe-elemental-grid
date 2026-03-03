import type { SimpleElementNode } from '@/types/elements';
import { getElementStatus } from '@/types/status';
import PublishToggle from '@/components/PublishToggle/PublishToggle';
import ElementActionsMenu from '@/components/ElementActionsMenu/ElementActionsMenu';

interface ElementCardProps {
  readonly element: SimpleElementNode;
}

/**
 * Compact read-only card showing an element's type, title, content preview,
 * and publication state via a colored left border.
 */
export default function ElementCard({ element }: ElementCardProps) {
  const status = getElementStatus(element.statusFlags);
  const label = element.blockSchema.label;
  const content = element.blockSchema.content;

  return (
    <div className={`element-card element-card--${status}`}>
      <div className="element-card__header">
        <span className="element-card__type">{label}</span>
        <h4 className="element-card__title">{element.title}</h4>
        <div className="element-card__actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <PublishToggle element={element} />
          <ElementActionsMenu element={element} />
        </div>
      </div>
      <div className={`element-card__content${content === '' ? ' element-card__content--empty' : ''}`}>
        {content || 'No preview available'}
      </div>
    </div>
  );
}
