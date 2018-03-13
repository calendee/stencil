import { TestingCompiler, TestingConfig } from '../../../testing';
import { mockElement, mockHtml } from '../../../testing/mocks';
import { OutputTarget } from '../../../declarations';
import * as path from 'path';


describe('dist loader/core resourcePath', () => {

  let c: TestingCompiler;
  let config: TestingConfig;


  it('default config', async () => {
    config = new TestingConfig();
    config.buildAppCore = true;
    config.rootDir = '/User/testing/';
    config.namespace = 'MyApp';
    config.outputTargets = [
      {
        type: 'dist'
      }
    ];

    c = new TestingCompiler(config);
    const distOutput = config.outputTargets.find(o => o.type === 'dist');
    expect(distOutput.resourcePath).toBeUndefined();

    await setupFs(c,
      '<script src="http://cdn.stenciljs.com/dist/myapp.js"></script>',
      `{
        "main": "dist/myapp.js",
        "collection\": "dist/collection/collection-manifest.json",
        "types": "dist/types/components.d.ts"
      }`);

    const r = await c.build();
    expect(r.diagnostics).toEqual([]);

    const { win, doc } = mockDom('/User/testing/www/index.html');

    const loaderContent = await c.fs.readFile('/User/testing/dist/myapp.js');
    execScript(win, doc, loaderContent);

    const coreScriptElm = doc.head.querySelector('script[data-resource-path][data-namespace="myapp"]');
    const resourcePath = coreScriptElm.getAttribute('data-resource-path');
    const coreScriptSrc = coreScriptElm.getAttribute('src');

    expect(resourcePath).toBe('http://cdn.stenciljs.com/dist/myapp/');
    expect(coreScriptSrc).toBe('http://cdn.stenciljs.com/dist/myapp/myapp.core.js');

    const coreContent = await c.fs.readFile('/User/testing/dist/myapp/myapp.core.js');
    execScript(win, doc, coreContent);

    expect(win.customElements.get('cmp-a')).toBeDefined();
  });


  it('custom buildDir config', async () => {
    config = new TestingConfig();
    config.buildAppCore = true;
    config.rootDir = '/User/testing/';
    config.namespace = 'MyApp';
    config.outputTargets = [
      {
        type: 'dist',
        buildDir: 'some-build'
      }
    ];

    c = new TestingCompiler(config);
    const distOutput = config.outputTargets.find(o => o.type === 'dist');
    expect(distOutput.resourcePath).toBeUndefined();

    await setupFs(c,
      '<script src="http://cdn.stenciljs.com/dist/some-build/myapp.js"></script>',
      `{
        "main": "dist/some-build/myapp.js",
        "collection\": "dist/collection/collection-manifest.json",
        "types": "dist/types/components.d.ts"
      }`);

    const r = await c.build();
    expect(r.diagnostics).toEqual([]);

    const { win, doc } = mockDom('/User/testing/www/index.html');

    const loaderContent = await c.fs.readFile('/User/testing/dist/some-build/myapp.js');
    execScript(win, doc, loaderContent);

    const coreScriptElm = doc.head.querySelector('script[data-resource-path][data-namespace="myapp"]');
    const resourcePath = coreScriptElm.getAttribute('data-resource-path');
    const coreScriptSrc = coreScriptElm.getAttribute('src');

    expect(resourcePath).toBe('http://cdn.stenciljs.com/dist/some-build/myapp/');
    expect(coreScriptSrc).toBe('http://cdn.stenciljs.com/dist/some-build/myapp/myapp.core.js');

    const coreContent = await c.fs.readFile('/User/testing/dist/some-build/myapp/myapp.core.js');
    execScript(win, doc, coreContent);

    expect(win.customElements.get('cmp-a')).toBeDefined();
  });


  function mockDom(htmlFilePath: string): { win: Window, doc: HTMLDocument } {
    const jsdom = require('jsdom');

    const html = c.fs.readFileSync(htmlFilePath);

    const dom = new jsdom.JSDOM(html, {
      url: 'http://emmitts-garage.com/?core=es2015'
    });

    const win = dom.window;
    const doc = win.document;

    win.fetch = {};

    win.CSS = {
      supports: () => true
    };

    win.requestAnimationFrame = (cb: Function) => {
      setTimeout(cb);
    };

    win.performance = {
      now: () => Date.now()
    };

    win.CustomEvent = class {};

    win.customElements = {
      define: (tag: string) => $definedTag[tag] = true,
      get: (tag: string) => $definedTag[tag]
    };

    const $definedTag = {};

    win.dispatchEvent = () => true;

    return { win, doc };
  }


  function execScript(win: any, doc: any, jsContent: string) {
    jsContent = jsContent.replace(/import\(/g, 'mockImport(');
    const winFn = new Function('window', 'document', jsContent);
    winFn(win, doc, jsContent);
  }


  async function setupFs(c: TestingCompiler, loaderSrc: string, packageJson: string) {
    await c.fs.writeFile('/User/testing/src/components/cmp-a.tsx', `@Component({ tag: 'cmp-a' }) export class CmpA {}`);

    await c.fs.writeFile(
      '/User/testing/www/index.html', `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="http://some-cdn.com/dist/other-stencil-app1.js" data-resource-path="http://some-cdn.com/dist/other-stencil-app1/" data-namespace="other-stencil-app1"></script>
          <script>/* some other inlined script */</script>
          <script src="assets/other-local-stencil-app2.js"></script>
          <script>/* some other inlined script */</script>
          <script src="assets/other-local-stencil-app2/other-local-stencil-app2.core.js" data-resource-path="/assets/other-local-stencil-app2/" data-namespace="other-local-stencil-app2"></script>
          <script src="assets/jquery.js"></script>
          <script src="http://some-cdn.com/dist/other-stencil-app3.js" data-resource-path="http://some-cdn.com/dist/other-stencil-app3/" data-namespace="other-stencil-app3"></script>
          ${loaderSrc}
        </head>
        <body>
          <script>/* some other inlined script */</script>
          <cmp-a></cmp-a>
          <script>/* some other inlined script */</script>
        </body>
        </html>
      `
    );

    if (packageJson) {
      await c.fs.writeFile('/User/testing/package.json', packageJson);
    }

    await c.fs.commit();
  }

  beforeEach(() => {
    (global as any).HTMLElement = class {};
  });

  afterEach(() => {
    delete (global as any).HTMLElement;
  });

});
