import * as d from '../../declarations';
import { MEMBER_TYPE, PROP_TYPE } from '../../util/constants';


export function angularProxy(_config: d.Config, _outputTarget: d.OutputTargetAngularProxy, cmpRegistry: d.ComponentRegistry) {

  const metadata = Object.keys(cmpRegistry).map(key => cmpRegistry[key]);

  metadata.sort((a, b) => {
    if (a.componentClass < b.componentClass) return -1;
    if (a.componentClass > b.componentClass) return 1;
    return 0;
  });

  const o: string[] = [];

  angularProxyInput(o);

  metadata.forEach(cmpMeta => {
    return angularComponent(o, cmpMeta);
  });

  console.log(o.join('\n'));
}


function angularProxyInput(o: string[]) {
  o.push(`function proxyInputs(instance: any, elm: any, props: string[]) {`);
  o.push(`  props.forEach(propName => {`);
  o.push(`    Object.defineProperty(instance, propName, {`);
  o.push(`      get: () => elm[propName],`);
  o.push(`      set: (val: any) => elm[propName] = val`);
  o.push(`    });`);
  o.push(`  });`);
  o.push(`}\n`);
}


function angularComponent(o: string[], cmpMeta: d.ComponentMeta) {
  const inputs: string[] = [];

  o.push(`@Directive({ selector: '${cmpMeta.tagNameMeta}' })`);
  o.push(`export class ${cmpMeta.componentClass} {`);

  Object.keys(cmpMeta.membersMeta).forEach(memberName => {
    const m = cmpMeta.membersMeta[memberName];

    if (m.memberType === MEMBER_TYPE.Prop || m.memberType === MEMBER_TYPE.PropMutable) {
      if (m.propType === PROP_TYPE.Boolean) {
        o.push(`@Input() ${memberName}: boolean;`);
        inputs.push(memberName);

      } else if (m.propType === PROP_TYPE.Number) {
        o.push(`@Input() ${memberName}: number;`);
        inputs.push(memberName);

      } else if (m.propType === PROP_TYPE.String) {
        o.push(`@Input() ${memberName}: string;`);
        inputs.push(memberName);

      } else if (m.propType === PROP_TYPE.Any) {
        o.push(`@Input() ${memberName}: any;`);
        inputs.push(memberName);
      }
    }
  });

  if (inputs.length > 0) {
    o.push(`constructor(e: ElementRef) { proxyInputs(this, e.nativeElement, ['${inputs.join(`','`)}']); }`);
  }

  o.push(`}\n`);
}
