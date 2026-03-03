<?php

declare(strict_types=1);

namespace WeDevelop\ElementalGrid\Forms;

use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\CheckboxField;
use SilverStripe\Forms\CompositeField;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldList;
use WeDevelop\ElementalGrid\Contract\GridConfigServiceInterface;

/**
 * A composite field that provides responsive grid configuration for an ElementColumn.
 *
 * Automatically loops through the viewports defined by GridConfigServiceInterface
 * and provides fields for Width, Offset, and Visibility for each viewport.
 */
class GridSettingsField extends CompositeField
{
    use Injectable;

    private readonly GridConfigServiceInterface $gridConfigService;

    public function __construct(string $name, string $title = '')
    {
        $this->gridConfigService = Injector::inst()->get(GridConfigServiceInterface::class);

        $viewports = $this->gridConfigService->getViewports();
        $columnCount = $this->gridConfigService->getColumnCount();

        $widthOptions = [];
        for ($i = 1; $i <= $columnCount; $i++) {
            $widthOptions[$i] = "$i Column" . ($i > 1 ? 's' : '');
        }

        $offsetOptions = ['0' => 'No Offset'];
        for ($i = 1; $i < $columnCount; $i++) {
            $offsetOptions[$i] = "$i Column" . ($i > 1 ? 's' : '') . " Offset";
        }

        $fields = [];

        foreach ($viewports as $viewport) {
            $vpKey = $viewport->key;
            $vpLabel = $viewport->label;

            $group = CompositeField::create([
                DropdownField::create("{$name}[{$vpKey}][width]", "{$vpLabel} Width")
                    ->setSource($widthOptions)
                    ->setEmptyString('Inherit Defaults'),
                DropdownField::create("{$name}[{$vpKey}][offset]", "{$vpLabel} Offset")
                    ->setSource($offsetOptions),
                CheckboxField::create("{$name}[{$vpKey}][visible]", "Visible on {$vpLabel}"),
            ])->setTitle("{$vpLabel} Settings");

            $fields[] = $group;
        }

        parent::__construct(FieldList::create($fields));
        $this->setName($name);
        $this->setTitle($title);
    }

    /**
     * Set the current value, distributing it to the child fields.
     */
    public function setValue($value, $data = null)
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        if (!is_array($value)) {
            $value = [];
        }

        foreach ($this->gridConfigService->getViewports() as $viewport) {
            $vpKey = $viewport->key;

            $widthField = $this->fieldByName("{$this->getName()}[{$vpKey}][width]");
            $offsetField = $this->fieldByName("{$this->getName()}[{$vpKey}][offset]");
            $visibleField = $this->fieldByName("{$this->getName()}[{$vpKey}][visible]");

            if (isset($value[$vpKey])) {
                $vpData = $value[$vpKey];
                if ($widthField && isset($vpData['width']))
                    $widthField->setValue($vpData['width']);
                if ($offsetField && isset($vpData['offset']))
                    $offsetField->setValue($vpData['offset']);
                if ($visibleField && isset($vpData['visible']))
                    $visibleField->setValue($vpData['visible']);
            }
        }

        return $this;
    }

    /**
     * Save data into the record in the expected JSON format.
     */
    public function saveInto(\SilverStripe\ORM\DataObjectInterface $record)
    {
        if (!$this->getName()) {
            return;
        }

        $fieldName = $this->getName();
        $viewports = $this->gridConfigService->getViewports();

        $settings = [];

        foreach ($viewports as $viewport) {
            $vpKey = $viewport->key;

            $widthField = $this->fieldByName("{$fieldName}[{$vpKey}][width]");
            $offsetField = $this->fieldByName("{$fieldName}[{$vpKey}][offset]");
            $visibleField = $this->fieldByName("{$fieldName}[{$vpKey}][visible]");

            /** @var int $width */
            $width = $widthField ? (int) $widthField->dataValue() : $this->gridConfigService->getColumnCount();
            /** @var int $offset */
            $offset = $offsetField ? (int) $offsetField->dataValue() : 0;
            /** @var bool $visible */
            $visible = $visibleField ? (bool) $visibleField->dataValue() : true;

            $settings[$vpKey] = [
                'width' => $width > 0 ? $width : $this->gridConfigService->getColumnCount(),
                'offset' => max(0, $offset),
                'visible' => $visible,
            ];
        }

        if ($record instanceof \SilverStripe\ORM\DataObject) {
            $record->setField($fieldName, json_encode($settings));
        }
    }
}
