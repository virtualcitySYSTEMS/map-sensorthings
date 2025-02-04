import type {
  BalloonFeatureInfoViewOptions,
  BalloonFeatureInfoViewProps,
  FeatureInfoEvent,
} from '@vcmap/ui';
import { BalloonFeatureInfoView } from '@vcmap/ui';
import type { Component } from 'vue';
import type { Layer } from '@vcmap/core';
import ChartBalloonComponent from './ChartBalloonComponent.vue';
import type {
  ChartFeatureInfoViewOptions,
  ChartFeatureInfoViewProperties,
} from './chartFeatureInfoView';

type ChartBalloonFeatureInfoViewOptions = BalloonFeatureInfoViewOptions &
  ChartFeatureInfoViewOptions;

type ChartBalloonFeatureInfoViewProps = BalloonFeatureInfoViewProps &
  ChartFeatureInfoViewProperties;

export default class ChartBalloonFeatureInfoView extends BalloonFeatureInfoView {
  static get className(): string {
    return 'ChartBalloonFeatureInfoView';
  }

  private _initialDayObservationRange: number | undefined;

  constructor(options: ChartBalloonFeatureInfoViewOptions) {
    super(
      options,
      ChartBalloonComponent as Component<
        BalloonFeatureInfoViewProps,
        unknown,
        unknown
      >,
    );
    this._initialDayObservationRange = options.initialDayObservationRange;
  }

  getProperties(
    featureInfo: FeatureInfoEvent,
    layer: Layer,
  ): ChartBalloonFeatureInfoViewProps {
    const properties = super.getProperties(featureInfo, layer);
    return {
      ...properties,
      balloonSubtitle: this.balloonSubtitle
        ? properties.balloonSubtitle
        : `Thing: ${properties.featureId}`,
      initialDayObservationRange: this._initialDayObservationRange,
    };
  }

  toJSON(): ChartBalloonFeatureInfoViewOptions {
    const json = super.toJSON() as ChartBalloonFeatureInfoViewOptions;
    if (this._initialDayObservationRange !== undefined) {
      json.initialDayObservationRange = this._initialDayObservationRange;
    }
    return json;
  }
}
