import * as d from '../../declarations';
import { setArrayConfig, setBooleanConfig, setNumberConfig } from './config-utils';


export function validatePrerender(config: d.Config, outputTarget: d.OutputTargetWww) {
  let defaults: d.OutputTargetWww;

  if (config.flags && config.flags.prerender) {
    // forcing a prerender build
    defaults = FULL_PRERENDER_DEFAULTS;

  } else {
    // not forcing a prerender build

    if (config.devMode) {
      // not forcing a prerender build
      // but we're in dev mode
      defaults = DEV_MODE_DEFAULTS;

    } else {
      // not forcing a prerender build
      // but we're in prod mode
      defaults = PROD_NON_HYDRATE_DEFAULTS;
    }
  }

  setBooleanConfig(outputTarget, 'canonicalLink', null, defaults.canonicalLink);
  setBooleanConfig(outputTarget, 'collapseWhitespace', null, defaults.collapseWhitespace);
  setBooleanConfig(outputTarget, 'hydrateComponents', null, defaults.hydrateComponents);
  setBooleanConfig(outputTarget, 'inlineStyles', null, defaults.inlineStyles);
  setBooleanConfig(outputTarget, 'inlineLoaderScript', null, defaults.inlineLoaderScript);
  setNumberConfig(outputTarget, 'inlineAssetsMaxSize', null, defaults.inlineAssetsMaxSize);
  setBooleanConfig(outputTarget, 'prerenderUrlCrawl', null, defaults.prerenderUrlCrawl);
  setArrayConfig(outputTarget, 'prerenderLocations', defaults.prerenderLocations);
  setBooleanConfig(outputTarget, 'prerenderPathHash', null, defaults.prerenderPathHash);
  setBooleanConfig(outputTarget, 'prerenderPathQuery', null, defaults.prerenderPathQuery);
  setNumberConfig(outputTarget, 'prerenderMaxConcurrent', null, defaults.prerenderMaxConcurrent);
  setBooleanConfig(outputTarget, 'removeUnusedStyles', null, defaults.removeUnusedStyles);

  if (outputTarget.hydrateComponents) {
    config.buildEs5 = true;
  }
}


const FULL_PRERENDER_DEFAULTS: d.OutputTargetWww = {
  canonicalLink: true,
  collapseWhitespace: true,
  hydrateComponents: true,
  inlineStyles: true,
  inlineLoaderScript: true,
  inlineAssetsMaxSize: 5000,
  prerenderUrlCrawl: true,
  prerenderLocations: [
    { path: '/' }
  ],
  prerenderPathHash: false,
  prerenderPathQuery: false,
  prerenderMaxConcurrent: 4,
  removeUnusedStyles: true
};


const PROD_NON_HYDRATE_DEFAULTS: d.OutputTargetWww = {
  canonicalLink: false,
  collapseWhitespace: true,
  hydrateComponents: false,
  inlineStyles: false,
  inlineLoaderScript: true,
  inlineAssetsMaxSize: 0,
  prerenderUrlCrawl: false,
  prerenderLocations: [],
  prerenderPathHash: false,
  prerenderPathQuery: false,
  prerenderMaxConcurrent: 0,
  removeUnusedStyles: false
};


const DEV_MODE_DEFAULTS: d.OutputTargetWww = {
  canonicalLink: false,
  collapseWhitespace: false,
  hydrateComponents: false,
  inlineStyles: false,
  inlineLoaderScript: false,
  inlineAssetsMaxSize: 0,
  prerenderUrlCrawl: false,
  prerenderLocations: [],
  prerenderPathHash: false,
  prerenderPathQuery: false,
  prerenderMaxConcurrent: 0,
  removeUnusedStyles: false
};
