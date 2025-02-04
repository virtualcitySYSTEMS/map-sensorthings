// This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
// It can be removed as soon as this MR is merged.
import type { LayerOptions, CesiumTilesetOptions } from '@vcmap/core';
import type { VcsUiApp } from '@vcmap/ui';

/**
 * Sets default of useSRGBColorFactors to true
 * Remove this default for VC Publisher 6.0
 * @param config
 */
export function setUseSRGBColorFactorsDefault(config: LayerOptions): void {
  if (config.type === 'CesiumTilesetLayer') {
    (config as CesiumTilesetOptions).tilesetOptions = {
      useSRGBColorFactors: true,
      ...(config as CesiumTilesetOptions).tilesetOptions,
    };
  }
}

export function getTileProviderTypes(app: VcsUiApp): string[] {
  return app.tileProviderClassRegistry
    .getClassNames()
    .filter((n) => n !== 'TileProvider');
}
