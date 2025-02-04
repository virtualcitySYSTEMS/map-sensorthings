import type { Layer } from '@vcmap/core';
import {
  AbstractFeatureInfoView,
  IframeComponent,
  renderTemplate,
} from '@vcmap/ui';
import type {
  FeatureInfoEvent,
  FeatureInfoViewOptions,
  IframeFeatureInfoViewProps,
  OptionsOrRef,
  VcsUiApp,
  WindowComponentOptions,
} from '@vcmap/ui';

export type DashboardFeatureInfoViewOptions = FeatureInfoViewOptions & {
  /** Optional mapping of thing ids to either a url or an extension that is added to the url. */
  thingDashboardMapping?: [number | string, number | string][];
  /** Optional url that can be a template using thing properties. */
  url?: string;
  /** Optional title of the iframe the dashboard is rendered in. */
  title?: string;
};

export function parseId(v: number | string): number | string {
  const parsed = Number(v);
  return v === '' || Number.isNaN(parsed) ? v : parsed;
}

export default class DashboardFeatureInfoView extends AbstractFeatureInfoView {
  static get className(): string {
    return 'DashboardFeatureInfoView';
  }

  private _url: string;

  private _thingDashboardMapping: Map<number | string, number | string>;

  private _title: string | undefined;

  private _windowHeader: OptionsOrRef<string | string[]> | undefined;

  constructor(options: DashboardFeatureInfoViewOptions) {
    super(options, IframeComponent);
    this._thingDashboardMapping = new Map(options.thingDashboardMapping);
    this._title = options.title;
    this._url = options.url || '';
    this._windowHeader = options.window?.state?.headerTitle;
  }

  getProperties(
    featureInfo: FeatureInfoEvent,
    layer: Layer,
  ): IframeFeatureInfoViewProps {
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

  toJSON(): DashboardFeatureInfoViewOptions {
    const json = {
      ...super.toJSON(),
    } as DashboardFeatureInfoViewOptions;
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
