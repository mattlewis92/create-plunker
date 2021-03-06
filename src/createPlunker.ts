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

export const PLUNKER_FORM_URL: string = 'https://plnkr.co/edit/?p=preview';

const CDN_BASE: string = 'https://unpkg.com/';

function isCssFile(filename: string): boolean {
  return filename.endsWith('.css');
}

function isJsFile(filename: string): boolean {
  return filename.endsWith('.js');
}

export class Plunker {

  private fields: Field[] = [];

  /**
   * Static factory method to create a new plunker
   * @returns {Plunker}
   */
  static create(): Plunker {
    return new Plunker(new HtmlFile());
  }

  constructor(public indexFile: HtmlFile) {}

  /**
   * Sets the description of the plunker
   * @param {string} description
   * @returns {Plunker}
   */
  setDescription(description: string): Plunker {
    this.fields.push({name: 'description', value: description});
    return this;
  }

  /**
   * Add a file to the plunker. By default will add a reference to js / css files to the index.html
   * @param {File} file
   * @param {boolean} skipAddToIndex
   * @returns {Plunker}
   */
  addFile(file: File, skipAddToIndex: boolean = false): Plunker {
    this.fields.push({name: `files[${file.name}]`, value: file.contents});
    if (isCssFile(file.name) && !skipAddToIndex) {
      this.indexFile.addStylesheetFile(file.name);
    } else if (isJsFile(file.name) && !skipAddToIndex) {
      this.indexFile.addScriptFile(file.name);
    }
    return this;
  }

  /**
   * Add multiple files to the plunker
   * @param {File[]} files
   * @param {boolean} skipAddToIndex
   * @returns {Plunker}
   */
  addFiles(files: File[], skipAddToIndex: boolean = false): Plunker {
    files.forEach(file => this.addFile(file, skipAddToIndex));
    return this;
  }

  /**
   * Adds an attribute to the html tag of the index.html file
   * @param {string} name
   * @param {string} value
   * @returns {Plunker}
   */
  addIndexHtmlAttribute(name: string, value: string): Plunker {
    this.indexFile.addHtmlAttribute(name, value);
    return this;
  }

  /**
   * Adds an attrbiute to the body tag of the index.html file
   * @param {string} name
   * @param {string} value
   * @returns {Plunker}
   */
  addIndexBodyAttribute(name: string, value: string): Plunker {
    this.indexFile.addBodyAttribute(name, value);
    return this;
  }

  /**
   * Add a line to the head tag of the index.html file
   * @param {string} line
   * @returns {Plunker}
   */
  addIndexHeadLine(line: string): Plunker {
    this.indexFile.addHeadLine(line);
    return this;
  }

  /**
   * Add an inline script to the index.html file
   * @param {string} source
   * @returns {Plunker}
   */
  addInlineScript(source: string): Plunker {
    this.indexFile.addInlineScript(source);
    return this;
  }

  /**
   * Add an npm package to the plunker. Will be hosted with https://unpkg.com/
   * @param {string} packageName
   * @param {any} version
   * @param {any} filename
   * @returns {Plunker}
   */
  addNpmPackage(packageName: string, {version, filename}: NpmPackageArgs = {}): Plunker {
    this.indexFile.addNpmPackage(packageName, {version, filename});
    return this;
  }

  /**
   * Sets the body of the index.html file
   * @param {string} body
   * @returns {Plunker}
   */
  setIndexBody(body: string): Plunker {
    this.indexFile.setBody(body);
    return this;
  }

  /**
   * Generates the plunker and by default opens the url for it in a new tab
   * @param {boolean} openInNewTab
   */
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
  const attributesString: string = attributes.map(({name, value}) => `${name}="${value}"`).join(' ');
  if (attributesString) {
    return ` ${attributesString}`;
  }
  return attributesString;
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

  addScriptFile(url: string): HtmlFile {
    return this.addHeadLine(`<script src="${url}"></script>`);
  }

  addStylesheetFile(url: string): HtmlFile {
    return this.addHeadLine(`<link href="${url}" rel="stylesheet">`);
  }

  addInlineScript(source: string): HtmlFile {
    return this.addHeadLine(`<script>\n    ${source}\n    </script>`);
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
    
<!DOCTYPE html>
<html${stringifyAttributes(this.htmlAttributes)}>
  <head>
    ${this.headLines.join('\n    ')}
  </head>
  <body${stringifyAttributes(this.bodyAttributes)}>
    ${this.body}
  </body>
</html>

`.trim();

  }

}
