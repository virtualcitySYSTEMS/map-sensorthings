import type { Layer } from '@vcmap/core';
import type {
  FeatureInfoEvent,
  FeatureInfoProps,
  FeatureInfoViewOptions,
  OptionsOrRef,
  VcsUiApp,
  WindowComponentOptions,
} from '@vcmap/ui';
import { AbstractFeatureInfoView } from '@vcmap/ui';
import type { Component } from 'vue';
import ChartComponent from './ChartComponent.vue';

export type ChartFeatureInfoViewOptions = FeatureInfoViewOptions & {
  initialDayObservationRange?: number;
};

export type ChartFeatureInfoViewProperties = FeatureInfoProps & {
  initialDayObservationRange?: number;
};

export default class ChartFeatureInfoView extends AbstractFeatureInfoView {
  static get className(): string {
    return 'ChartFeatureInfoView';
  }

  private _initialDayObservationRange: number | undefined;

  private _windowHeader: OptionsOrRef<string | string[]> | undefined;

  constructor(options: ChartFeatureInfoViewOptions) {
    super(
      { ...ChartFeatureInfoView.getDefaultOptions(), ...options },
      ChartComponent as Component<FeatureInfoProps, unknown, unknown>,
    );
    this._initialDayObservationRange = options.initialDayObservationRange;
    this._windowHeader = options.window?.state?.headerTitle;
  }

  getProperties(
    featureInfo: FeatureInfoEvent,
    layer: Layer,
  ): ChartFeatureInfoViewProperties {
    const properties = super.getProperties(featureInfo, layer);
    return {
      ...properties,
      initialDayObservationRange: this._initialDayObservationRange,
    };
  }

  getWindowComponentOptions(
    app: VcsUiApp,
    featureInfo: FeatureInfoEvent,
    layer: Layer,
  ): WindowComponentOptions {
    const windowOptions = super.getWindowComponentOptions(
      app,
      featureInfo,
      layer,
    );
    if (!this._windowHeader && windowOptions.state) {
      windowOptions.state.headerTitle = `${layer.name} - Thing: ${featureInfo.feature.getId()}`;
    }
    return windowOptions;
  }

  toJSON(): ChartFeatureInfoViewOptions {
    const json = super.toJSON() as ChartFeatureInfoViewOptions;
    if (this._initialDayObservationRange !== undefined) {
      json.initialDayObservationRange = this._initialDayObservationRange;
    }
    return json;
  }
}
