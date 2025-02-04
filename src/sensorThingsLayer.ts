import type { VectorTileOptions } from '@vcmap/core';
import {
  parseGeoJSON,
  StaticFeatureTileProvider,
  VectorTileLayer,
} from '@vcmap/core';
import { queryThingsWithLocations } from './sensorThingsAPI.js';

export type SensorThingsOptions = Omit<
  VectorTileOptions,
  'tileProvider' | 'url'
> & {
  url: string;
  observedProperty?: string;
};

export type ThingFeatureProperties = {
  name: string;
} & Record<string, unknown>;

function getSensorIconDataUrl(): string {
  return `data:image/svg+xml,%3Csvg%20width%3D%2260.5%22%20height%3D%22100.25%22%20viewBox%3D%220%200%2032.015%2053.049%22%20xml%3Aspace%3D%22preserve%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20transform%3D%22translate(.047%20-.06)%22%3E%3Crect%20style%3D%22fill%3A%23005434%3Bfill-opacity%3A1%3Bstroke%3A%23fff%3Bstroke-width%3A.197361%3Bstroke-linecap%3Around%3Bstroke-linejoin%3Around%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20width%3D%2231.817%22%20height%3D%2220.567%22%20x%3D%22.051%22%20y%3D%22.16%22%20ry%3D%22.983%22%2F%3E%3Ctext%20xml%3Aspace%3D%22preserve%22%20style%3D%22font-style%3Anormal%3Bfont-variant%3Anormal%3Bfont-weight%3A700%3Bfont-stretch%3Anormal%3Bfont-size%3A7.46459px%3Bfont-family%3ABahnschrift%3B-inkscape-font-specification%3A%26quot%3BBahnschrift%20Bold%26quot%3B%3Bfill%3A%23fff%3Bfill-opacity%3A1%3Bstroke%3A%23fff%3Bstroke-width%3A0%3Bstroke-linecap%3Around%3Bstroke-linejoin%3Around%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20x%3D%223.746%22%20y%3D%2212.837%22%20transform%3D%22scale(1.02422%20.97635)%22%3E%3Ctspan%20style%3D%22font-style%3Anormal%3Bfont-variant%3Anormal%3Bfont-weight%3A700%3Bfont-stretch%3Anormal%3Bfont-size%3A7.46459px%3Bfont-family%3ABahnschrift%3B-inkscape-font-specification%3A%26quot%3BBahnschrift%20Bold%26quot%3B%3Bfill%3A%23fff%3Bstroke%3A%23fff%3Bstroke-width%3A0%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20x%3D%223.746%22%20y%3D%2212.837%22%3ESensor%20%3C%2Ftspan%3E%3C%2Ftext%3E%3Cpath%20style%3D%22fill%3A%23005434%3Bfill-opacity%3A1%3Bstroke%3A%23005434%3Bstroke-width%3A.702471%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Around%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20d%3D%22M15.96%2020.561V53.11%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E`;
}

export class SensorThingsLayer extends VectorTileLayer {
  static get className(): string {
    return 'SensorThingsLayer';
  }

  static getDefaultOptions(): Omit<SensorThingsOptions, 'url'> {
    return {
      ...super.getDefaultOptions(),
      renderer: 'primitive',
      minLevel: 1,
      maxLevel: 15,
      style: {
        type: 'VectorStyleItem',
        image: {
          src: getSensorIconDataUrl(),
        },
        fill: {
          color: [255, 255, 255, 1],
        },
        stroke: {
          color: [0, 0, 0, 1],
          width: 1,
        },
      },
    };
  }

  private _observedProperty: string | undefined;

  constructor(options: SensorThingsOptions) {
    const defaultOptions = SensorThingsLayer.getDefaultOptions();
    const mergedOptions = {
      ...options,
      renderer: options.renderer ?? defaultOptions.renderer,
      minLevel: options.minLevel || defaultOptions.minLevel,
      maxLevel: options.maxLevel || defaultOptions.maxLevel,
      style: options.style ?? defaultOptions.style,
    };
    super(mergedOptions);

    this._observedProperty = options.observedProperty;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        const things = await queryThingsWithLocations(
          this.url,
          this._observedProperty,
          this.extent ?? undefined,
        );
        if (things.length === 0) {
          this.getLogger().warning(
            `The request to the SensorThings API of layer "${this.name}" did not return any entities. Make sure the filters (extent, observerProperty) are set correctly.`,
          );
        }
        const thingFeatures = things
          .filter((thing) => !!thing.Locations[0])
          .map((thing) => {
            const feature = parseGeoJSON(thing.Locations[0].location)
              .features[0];
            feature.setId(String(thing['@iot.id']));
            feature.setProperties({
              name: thing.name,
              ...thing.properties,
            } as ThingFeatureProperties);
            return feature;
          });

        if (things.length !== thingFeatures.length) {
          this.getLogger().warning(
            `On layer "${this.name}" ${things.length - thingFeatures.length} things lack location data and were excluded.`,
          );
        }

        this.tileProvider = new StaticFeatureTileProvider({
          features: thingFeatures,
        });
        await super.initialize();
      } catch (error) {
        this.getLogger().error(
          `Initializing of layer "${this.name}" failed, due to a`,
          error,
          'Please ensure that the url is correct.',
        );
      }
    }
  }

  get observedProperty(): string | undefined {
    return this._observedProperty;
  }

  toJSON(): SensorThingsOptions {
    const { tileProvider, ...rest } = super.toJSON();
    const json: SensorThingsOptions = { ...rest, url: this.url };
    if (this._observedProperty) {
      json.observedProperty = this._observedProperty;
    }
    return json;
  }
}
