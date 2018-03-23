import * as d from '../../declarations';
import { normalizePath } from '../util';


export function validateOutputTargetAngularProxy(config: d.Config) {
  const path = config.sys.path;

  const distOutputTargets = (config.outputTargets as d.OutputTargetAngular[]).filter(o => o.type === 'angular');

  distOutputTargets.forEach(outputTarget => {
    if (!path.isAbsolute(outputTarget.directivesProxyFile)) {
      outputTarget.directivesProxyFile = normalizePath(path.join(config.rootDir, outputTarget.directivesProxyFile));
    }
  });
}
