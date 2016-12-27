export interface File {
  name: string;
  contents: string;
}

interface Field {
  name: string;
  value: string;
}

export interface NpmPackageArgs {
  version?: string;
  filename?: string;
}

export const PLUNKER_FORM_URL: string = 'http://plnkr.co/edit/?p=preview';

const CDN_BASE: string = 'https://unpkg.com/';

function isCssFile(filename: string): boolean {
  return filename.endsWith('.css');
}

function isJsFile(filename: string): boolean {
  return filename.endsWith('.js');
}

export class Plunker {

  private fields: Field[] = [];

  static create(): Plunker {
    return new Plunker(new HtmlFile());
  }

  constructor(public indexFile: HtmlFile) {}

  setDescription(description: string): Plunker {
    this.fields.push({name: 'description', value: description});
    return this;
  }

  addFile(file: File): Plunker {
    this.fields.push({name: `files[${file.name}]`, value: file.contents});
    if (isCssFile(file.name)) {
      this.indexFile.addStylesheetFile(file.name);
    } else if (isJsFile(file.name)) {
      this.indexFile.addScriptFile(file.name);
    }
    return this;
  }

  addFiles(files: File[]): Plunker {
    files.forEach(file => this.addFile(file));
    return this;
  }

  addIndexHtmlAttribute(name: string, value: string): Plunker {
    this.indexFile.addHtmlAttribute(name, value);
    return this;
  }

  addIndexBodyAttribute(name: string, value: string): Plunker {
    this.indexFile.addBodyAttribute(name, value);
    return this;
  }

  addNpmPackage(packageName: string, {version, filename}: NpmPackageArgs = {}): Plunker {
    this.indexFile.addNpmPackage(packageName, {version, filename});
    return this;
  }

  setIndexBody(body: string): Plunker {
    this.indexFile.setBody(body);
    return this;
  }

  save(openInNewTab: boolean = true): void {

    const form: HTMLFormElement = document.createElement('form');
    form.style.display = 'none';
    form.setAttribute('method', 'post');
    form.setAttribute('action', PLUNKER_FORM_URL);
    if (openInNewTab) {
      form.setAttribute('target', '_blank');
    }

    const indexFile: Field = {name: 'files[index.html]', value: this.indexFile.getHtml()};

    [indexFile, ...this.fields].forEach(field => {
      const input: HTMLInputElement = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', field.name);
      input.setAttribute('value', field.value);
      form.appendChild(input);
    });

    const submit: HTMLInputElement = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'submit');
    submit.innerHTML = 'Submit';
    form.appendChild(submit);

    document.body.appendChild(form);
    submit.click();
    document.body.removeChild(form);

  }

}

function stringifyAttributes(attributes: Field[]): string {
  return attributes.map(({name, value}) => `${name}="${value}"`).join(' ');
}

export class HtmlFile {

  private htmlAttributes: Field[] = [];

  private bodyAttributes: Field[] = [];

  private headLines: string[] = [];

  private body: string = '';

  addHtmlAttribute(name: string, value: string): HtmlFile {
    this.htmlAttributes.push({name, value});
    return this;
  }

  addBodyAttribute(name: string, value: string): HtmlFile {
    this.bodyAttributes.push({name, value});
    return this;
  }

  addHeadLine(line: string): HtmlFile {
    this.headLines.push(line);
    return this;
  }

  addScriptFile(src: string): HtmlFile {
    return this.addHeadLine(`<script src="${src}"></script>`);
  }

  addStylesheetFile(src: string): HtmlFile {
    return this.addHeadLine(`<link href="${src}" rel="stylesheet">`);
  }

  addNpmPackage(packageName: string, {version, filename}: NpmPackageArgs = {}): HtmlFile {
    let url: string = `${CDN_BASE}${packageName}`;
    if (version) {
      url += `@${version}`;
    }
    if (filename) {
      url += `/${filename}`;
    }
    if (filename && isCssFile(filename)) {
      return this.addStylesheetFile(url);
    } else {
      return this.addScriptFile(url);
    }
  }

  setBody(body: string): HtmlFile {
    this.body = body;
    return this;
  }

  getHtml(): string {

    return `
    
<!doctype html>
<html ${stringifyAttributes(this.htmlAttributes)}>
  <head>
    ${this.headLines.join('\n    ')}
  </head>
  <body ${stringifyAttributes(this.bodyAttributes)}>
    ${this.body}
  </body>
</html>

`.trim();

  }

}