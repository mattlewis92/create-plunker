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