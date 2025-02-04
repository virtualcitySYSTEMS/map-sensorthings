import type { Layer } from '@vcmap/core';
import type {
  BalloonFeatureInfoViewProps,
  BalloonFeatureInfoViewOptions,
  FeatureInfoEvent,
} from '@vcmap/ui';
import { BalloonFeatureInfoView, renderTemplate } from '@vcmap/ui';
import type { Component } from 'vue';
import {
  parseId,
  type DashboardFeatureInfoViewOptions,
} from './dashboardFeatureInfoView.js';
import IframeBalloonComponent from './IframeBalloonComponent.vue';

export type DashboardBalloonFeatureInfoViewOptions =
  DashboardFeatureInfoViewOptions & BalloonFeatureInfoViewOptions;

export type DashboardFeatureInfoViewProps = BalloonFeatureInfoViewProps & {
  src: string;
  title?: string;
};

export default class DashboardBalloonFeatureInfoView extends BalloonFeatureInfoView {
  static get className(): string {
    return 'DashboardBalloonFeatureInfoView';
  }

  private _url: string;

  private _thingDashboardMapping: Map<number | string, number | string>;

  private _title: string | undefined;

  constructor(options: DashboardBalloonFeatureInfoViewOptions) {
    super(
      options,
      IframeBalloonComponent as Component<
        BalloonFeatureInfoViewProps,
        unknown,
        unknown
      >,
    );
    this._thingDashboardMapping = new Map(options.thingDashboardMapping);
    this._title = options.title;
    this._url = options.url || '';
  }

  getProperties(
    featureInfo: FeatureInfoEvent,
    layer: Layer,
  ): DashboardFeatureInfoViewProps {
    const properties = super.getProperties(featureInfo, layer);
    const renderedTemplateUrl = renderTemplate(
      this._url,
      properties.attributes as Record<string, unknown>,
    );
    const dashboardExtension =
      this._thingDashboardMapping.get(parseId(properties.featureId)) || '';
    const src = `${renderedTemplateUrl}${dashboardExtension}`;
    return {
      ...properties,
      src,
      title: this._title,
      balloonSubtitle: this.balloonSubtitle
        ? properties.balloonSubtitle
        : `Thing: ${properties.featureId}`,
    };
  }

  toJSON(): DashboardBalloonFeatureInfoViewOptions {
    const json = {
      ...super.toJSON(),
    } as DashboardBalloonFeatureInfoViewOptions;
    if (this._thingDashboardMapping.size > 0) {
      json.thingDashboardMapping = this._thingDashboardMapping
        .entries()
        .toArray();
    }
    if (this._title !== undefined) {
      json.title = this._title;
    }
    if (this._url !== '') {
      json.url = this._url;
    }
    return json;
  }
}
