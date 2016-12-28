/// <reference types="mocha" />

import 'core-js';
import {expect} from 'chai';
import {Plunker, PLUNKER_FORM_URL} from '../src/createPlunker';

describe('createPlunker', () => {

  let eventListener: EventListenerOrEventListenerObject | null;

  function formHandler(fn: any): Promise<any> {
    return new Promise((resolve, reject) => {

      function handleSubmitEvent(event: Event): void {
        document.removeEventListener('submit', handleSubmitEvent);
        event.preventDefault();
        const form: any = event.target;
        try {
          fn(form);
          resolve();
        } catch (e) {
          reject(e);
        }
      }

      document.addEventListener('submit', handleSubmitEvent);
      eventListener = handleSubmitEvent;
    });
  }

  afterEach(() => {
    if (eventListener) {
      document.removeEventListener('submit', eventListener);
      eventListener = null;
    }
  });

  it('should set the plunker form data', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(getComputedStyle(form).display).to.equal('none');
      expect(form.getAttribute('method')).to.equal('post');
      expect(form.getAttribute('action')).to.equal(PLUNKER_FORM_URL);
      expect(form.getAttribute('target')).to.equal('_blank');
    });
    Plunker.create().save();
    return handler;
  });

  it('should not open the plunker in a new tab', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.getAttribute('target')).not.to.be.ok;
    });
    Plunker.create().save(false);
    return handler;
  });

  it('should set the plunker description', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name=description]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().setDescription('foo').save();
    return handler;
  });

  it('should add local files to the plunker', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[foo.txt]"]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().addFiles([{name: 'foo.txt', contents: 'foo'}]).save();
    return handler;
  });

  it('should add the index.html', () => {
    const plunker: Plunker = Plunker.create();
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[index.html]"]').getAttribute('value')).to.equal(plunker.indexFile.getHtml());
    });
    plunker.save();
    return handler;
  });

  it('should add js files', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[index.html]"]').getAttribute('value')
        .includes('<script src="foo.js"></script>')).to.be.true;
      expect(form.querySelector('input[name="files[foo.js]"]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().addFiles([{name: 'foo.js', contents: 'foo'}]).save();
    return handler;
  });

  it('should add js files but not to the index', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[index.html]"]').getAttribute('value')
        .includes('<script src="foo.js"></script>')).to.be.false;
      expect(form.querySelector('input[name="files[foo.js]"]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().addFiles([{name: 'foo.js', contents: 'foo'}], true).save();
    return handler;
  });

  it('should add css files', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[index.html]"]').getAttribute('value')
        .includes('<link href="foo.css" rel="stylesheet">')).to.be.true;
      expect(form.querySelector('input[name="files[foo.css]"]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().addFiles([{name: 'foo.css', contents: 'foo'}]).save();
    return handler;
  });

  it('should add css files but not to the index', () => {
    const handler: Promise<any> = formHandler((form: HTMLFormElement) => {
      expect(form.querySelector('input[name="files[index.html]"]').getAttribute('value')
        .includes('<link href="foo.css" rel="stylesheet">')).to.be.false;
      expect(form.querySelector('input[name="files[foo.css]"]').getAttribute('value')).to.equal('foo');
    });
    Plunker.create().addFiles([{name: 'foo.css', contents: 'foo'}], true).save();
    return handler;
  });

  it('should give a basic html template', () => {
    const plunker: Plunker = Plunker.create();
    plunker.indexFile.addHeadLine('<script src="foo.js"></script>');
    plunker.indexFile.addHeadLine('<script src="bar.js"></script>');
    expect(plunker.indexFile.getHtml()).to.equal(`
<!DOCTYPE html>
<html>
  <head>
    <script src="foo.js"></script>
    <script src="bar.js"></script>
  </head>
  <body>
    
  </body>
</html>
`.trim());
  });

  it('should add attributes to the html index file', () => {
    const plunker: Plunker = Plunker.create().addIndexHtmlAttribute('foo', 'bar');
    expect(plunker.indexFile.getHtml().includes('<html foo="bar">')).to.be.true;
  });

  it('should add attributes to the html index file body', () => {
    const plunker: Plunker = Plunker.create().addIndexBodyAttribute('foo', 'bar');
    expect(plunker.indexFile.getHtml().includes('<body foo="bar">')).to.be.true;
  });

  it('should set the body of the html', () => {
    const plunker: Plunker = Plunker.create().setIndexBody('<div>foo</div>');
    expect(plunker.indexFile.getHtml().includes('<body>\n    <div>foo</div>\n  </body>')).to.be.true;
  });

  it('should add an npm package pointing to its default export', () => {
    const plunker: Plunker = Plunker.create().addNpmPackage('angular-calendar');
    expect(plunker.indexFile.getHtml().includes('<script src="https://unpkg.com/angular-calendar"></script>')).to.be.true;
  });

  it('should add an npm package pointing to a specific version of its default export', () => {
    const plunker: Plunker = Plunker.create().addNpmPackage('angular-calendar', {version: '0.5.0'});
    expect(plunker.indexFile.getHtml().includes('<script src="https://unpkg.com/angular-calendar@0.5.0"></script>')).to.be.true;
  });

  it('should add an npm package pointing to a specific version of a specific file', () => {
    const plunker: Plunker = Plunker.create().addNpmPackage('angular-calendar', {version: '0.5.0', filename: 'foo.js'});
    expect(plunker.indexFile.getHtml().includes('<script src="https://unpkg.com/angular-calendar@0.5.0/foo.js"></script>')).to.be.true;
  });

  it('should add an npm package pointing to a stylesheet', () => {
    const plunker: Plunker = Plunker.create().addNpmPackage('angular-calendar', {filename: 'dist/css/angular-calendar.css'});
    expect(plunker.indexFile.getHtml().includes('<link href="https://unpkg.com/angular-calendar/dist' +
      '/css/angular-calendar.css" rel="stylesheet">')).to.be.true;
  });

  it('should add a document title', () => {
    const plunker: Plunker = Plunker.create().addIndexHeadLine('<title>foo</title>');
    expect(plunker.indexFile.getHtml().includes('<title>foo</title>')).to.be.true;
  });

  it('should add an inline script', () => {
    const plunker: Plunker = Plunker.create().addInlineScript('alert("foo");');
    expect(plunker.indexFile.getHtml()).to.equal(`
<!DOCTYPE html>
<html>
  <head>
    <script>
    alert("foo");
    </script>
  </head>
  <body>
    
  </body>
</html>
`.trim());
  });

});