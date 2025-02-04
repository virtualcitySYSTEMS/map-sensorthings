// This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
// It can be removed as soon as this MR is merged.
import type {
  ExtentOptions,
  LayerOptions,
  VcsObjectOptions,
  VectorOptions,
} from '@vcmap/core';
import {
  Extent,
  WMTSLayer,
  wgs84Projection,
  getDefaultProjection,
} from '@vcmap/core';

export type EnsuredKey<T, K extends keyof T> = T & Required<Pick<T, K>>;

export function getPrefixedSlots(
  prefix: string,
  slots: string[] = ['prepend', 'default', 'append'],
): Array<{ name: string; prefixed: string }> {
  return slots.map((name) => ({ name, prefixed: `${prefix}-${name}` }));
}

export function ensureKey<T, K extends keyof T>(
  config: T,
  key: K,
  defaultValue: NonNullable<T[K]>,
): EnsuredKey<T, K> {
  config[key] = config[key] ?? defaultValue;
  return config as EnsuredKey<T, K>;
}

function getDefaultExtent(type?: string): ExtentOptions {
  const options = new Extent({
    projection: wgs84Projection.toJSON(),
  }).toJSON();
  if (type === WMTSLayer.className) {
    options.coordinates = [-180, -85, 180, 85];
  }
  return options;
}

export function ensureExtent<T extends LayerOptions>(
  config: T,
): EnsuredKey<T, 'extent'> {
  return ensureKey(config, 'extent', getDefaultExtent(config.type));
}

export function ensureProjection<T extends VectorOptions>(
  config: T,
): EnsuredKey<T, 'projection'> {
  return ensureKey(config, 'projection', getDefaultProjection().toJSON());
}

export function ensureProperties<T extends VcsObjectOptions>(
  config: T,
): EnsuredKey<T, 'properties'> {
  return ensureKey(config, 'properties', {});
}

export function ensureKeys<T, K extends keyof T = never>(
  config: T,
  ensureFunctions: { [EK in K]: (config: T) => EnsuredKey<T, EK> },
): asserts config is EnsuredKey<T, K> {
  Object.values(ensureFunctions as ((config: T) => EnsuredKey<T, K>)[]).forEach(
    (ensureFunction) => {
      ensureFunction(config);
    },
  );
}
