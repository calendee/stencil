import { Config, OutputTarget } from '../../declarations';
import { pathJoin } from '../util';


export function validateDocs(config: Config) {
  if (config.flags.docs) {
    if (config.outputTargets) {
      if (!config.outputTargets.some(o => o.type === 'docs')) {
        config.outputTargets.push({ type: 'docs' });
      }

      config.outputTargets.forEach(outputTarget => {
        validateDocsOutputTarget(config, outputTarget);
      });
    }

  } else {
    if (config.outputTargets) {
      config.outputTargets = config.outputTargets.filter(o => o.type !== 'docs');
    }
  }
}


function validateDocsOutputTarget(config: Config, outputTarget: OutputTarget) {
  if (outputTarget.format === 'json') {
    if (!outputTarget.dir) {
      outputTarget.dir = 'dist/docs';
    }
    if (!config.sys.path.isAbsolute(outputTarget.dir)) {
      outputTarget.dir = pathJoin(config, config.rootDir, outputTarget.dir);
    }

  } else {
    outputTarget.format = 'readme';
  }
}
