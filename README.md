# create-plunker
A helper utility to create plunkers

Example usage
```typescript
import { Plunker } from 'create-plunker';

Plunker.create()
  .setDescription('Description')
  .addNpmPackage('moment')
  .addFile({name: 'foo.js', contents: 'alert("foo included");'})
  .setIndexBody('Hello world!')
  .save();
```

For a full list of API docs see [here](https://mattlewis92.github.io/create-plunker/docs/classes/_src_createplunker_.plunker.html) and for more example usage [see the tests](https://github.com/mattlewis92/create-plunker/blob/master/test/createPlunker.spec.ts).