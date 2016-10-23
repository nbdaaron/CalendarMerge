# origami
Fold utilities

## API

### `construct`

Fold in a constructor to instantiate with data.

```js
function Model(data){
  this.data = data;
}

when.resolve({ hello: 'world' })
  .fold(construct, Model)
  .then(function(model){
    // `model` is an instance of Model
  });
```

### `reach`

Fold in a deep object path to extract from data.

```js
var data = {
  some: {
    deep: {
      prop: 'hello world'
    }
  }
};

when.resolve(data)
  .fold(reach, 'some.deep.prop')
  .then(function(val){
    // `val` is 'hello world'
  });
```

### Old `origami`

If you are looking for the old version of `origami`, please use `npm install origami@0.1.0`.
