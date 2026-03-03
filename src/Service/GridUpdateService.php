<?php

declare(strict_types=1);

namespace WeDevelop\ElementalGrid\Service;

use SilverStripe\Core\Injector\Injectable;
use WeDevelop\ElementalGrid\Contract\GridConfigServiceInterface;
use WeDevelop\ElementalGrid\Elements\ElementColumn;
use WeDevelop\ElementalGrid\Model\Result;
use WeDevelop\ElementalGrid\Model\ValidationError;

/**
 * Validates and updates the responsive grid settings for an ElementColumn.
 */
class GridUpdateService
{
    use Injectable;
    /** @var array<string, string> */
    private static array $dependencies = [
        'gridConfigService' => '%$' . GridConfigServiceInterface::class,
        'persistenceService' => '%$' . ElementPersistenceService::class,
    ];

    public GridConfigServiceInterface $gridConfigService;

    public ElementPersistenceService $persistenceService;

    /**
     * @param array{viewport: string, width: int, offset: int, visible: bool} $payload
     * @return Result<ElementColumn>
     */
    public function updateSettings(ElementColumn $column, array $payload): Result
    {
        $viewport = $payload['viewport'];
        $width = $payload['width'];
        $offset = $payload['offset'];
        $visible = $payload['visible'];

        // Validate viewport
        $validViewports = array_map(
            static fn($vp) => $vp->key,
            $this->gridConfigService->getViewports()
        );

        if (!in_array($viewport, $validViewports, true)) {
            return Result::fail(new ValidationError(
                message: "Invalid viewport: '{$viewport}'.",
                field: 'viewport',
            ));
        }

        $columnCount = $this->gridConfigService->getColumnCount();

        // Validate width
        if ($width < 1 || $width > $columnCount) {
            return Result::fail(new ValidationError(
                message: "Width must be between 1 and {$columnCount}.",
                field: 'width',
            ));
        }

        // Validate offset
        if ($offset < 0 || $offset >= $columnCount) {
            return Result::fail(new ValidationError(
                message: "Offset must be between 0 and " . ($columnCount - 1) . ".",
                field: 'offset',
            ));
        }

        // Ensure width + offset doesn't exceed total columns
        if ($width + $offset > $columnCount) {
            return Result::fail(new ValidationError(
                message: "Width and offset combined cannot exceed {$columnCount} columns.",
                field: 'width',
            ));
        }

        // Fetch existing settings or defaults, then patch
        $settings = $column->getGridSettingsData();
        $settings[$viewport] = [
            'width' => $width,
            'offset' => $offset,
            'visible' => $visible,
        ];

        $column->setGridSettingsData($settings);

        /** @var Result<ElementColumn> $result */
        $result = $this->persistenceService->persistBatch([$column]);

        if (!$result->isOk()) {
            return $result;
        }

        return Result::ok($column);
    }
}
