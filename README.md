# cf-pgp

Plugin for files encryption/decryption using PGP.

## Usage

Plugin can be used in 2 ways:
  - enctyption
  - decryption
  
To choose the way plugin should run provide `ACTION` argument that can take 2 possible values - `encrypt` or `decrypt`.

## Encryption

Requiered arguments:
  - `GLOB` - glob expression used to match files
  - `PUBLIC_KEY`
### Example:
```yaml
steps:
  encrypt:
    title: Encrypt a password file
    type: codefresh-inc/pgp
    arguments:
      ACTION: encrypt
      GLOB: '*.txt'
      PUBLIC_KEY: LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0t*********
```
## Decryption

Requiered arguments:
  - `GLOB` - glob expression used to match files
  - `PRIVATE_KEY`
  - `PASS_PHRASE` - glob expression used to match files
### Example:
```yaml
steps:
  decrypt:
    title: Decrypt a password file
    type: codefresh-inc/pgp
    arguments:
      ACTION: decrypt
      GLOB: '*.txt'
      PRIVATE_KEY: LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0t*********
      PASS_PHRASE: LS0t***

```
