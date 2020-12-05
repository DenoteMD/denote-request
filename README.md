# Denote Request

## Instruction

A request wrapper build on top of `denote-ui` and `axios`

## Installation

```
npm i denote-request
```

## Example

```ts
import { DenoteUserIdentity } from 'denote-ui';
import { DenoteRequest } from 'denote-request';

(async () => {
  const user = DenoteUserIdentity.fromMnemonic(
    'jump dirt foam license journey imitate forum orient hard miracle task castle',
  );

  const dr = DenoteRequest.init(user);

  const res = await dr.request({
    method: 'POST',
    url: 'http://localhost:1337/v1/echo',
    data: {
      msg: 'Hello',
      sender: 'Chiro',
    },
  });

  console.log(res.data);
})();
```

## License

This software was licensed under [MIT License](https://github.com/DenoteMD/denote-request/blob/master/LICENSE)
