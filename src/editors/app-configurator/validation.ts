// This file is copy pasted from https://gitlab.virtualcitysystems.de/vcsuite/npm/vcmap/app-configurator/-/merge_requests/65
// It can be removed as soon as this MR is merged.
import type { Collection, VcsObject } from '@vcmap/core';
import {
  DeclarativeStyleItem,
  moduleIdSymbol,
  parseGeoJSON,
} from '@vcmap/core';
import type { VcsUiApp } from '@vcmap/ui';

/**
 * Validate item name to be not empty and unique in collection (for dynamic module)
 * @param app
 * @param collection
 * @param item
 * @param name
 */
export function validItemName<T extends VcsObject>(
  app: VcsUiApp,
  collection: Collection<T>,
  item: T,
  name: string,
): string | true {
  if (!name || name === '') {
    return 'appConfigurator.item.emptyKey';
  }
  if (name !== item.name && collection.hasKey(name)) {
    const collectionItem = collection.getByKey(name);
    if (app.dynamicModuleId === collectionItem?.[moduleIdSymbol]) {
      // ensure uniqueness within dynamic module! allow for different modules (override)
      return 'appConfigurator.item.uniqueKey';
    }
  }
  return true;
}

export function isRequiredString(value: string): string | true {
  if (!value && value === '') return 'appConfigurator.validation.isRequired';
  return true;
}

export function isValidJson(value: string): string | true {
  try {
    const obj = JSON.parse(value);
    if (obj) {
      return true;
    }
    return 'appConfigurator.editors.jsonEditor.invalid';
  } catch (e) {
    return (e as Error).toLocaleString();
  }
}

export function isValidGeojson(value: string): string | true {
  const { features } = parseGeoJSON(value);
  return features.length > 0 || 'appConfigurator.editors.layer.geojson.invalid';
}

export function isValidDeclarativeStyle(value: string): string | true {
  const parseJson = (val: string): object | string => {
    try {
      return JSON.parse(val) as object;
    } catch (e) {
      return (e as Error).toLocaleString();
    }
  };
  const declarativeStyle = parseJson(value);
  if (typeof declarativeStyle === 'object') {
    try {
      const style = new DeclarativeStyleItem({ declarativeStyle });
      if (style) {
        return true;
      }
      return 'appConfigurator.editors.style.declarative.invalid';
    } catch (e) {
      return (e as Error).message;
    }
  }
  return declarativeStyle;
}
