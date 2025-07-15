sap.ui.define(
  [
    // prettier 방지용 주석
    'sap/ui/base/Object',
  ],
  (
    // prettier 방지용 주석
    BaseObject
  ) => {
    'use strict';

    return BaseObject.extend('sap.ui.time.common.AesUtil', {
      // AesUtil: null,

      // constructor: function () {
      //   this.AesUtil = function (keySize, iterationCount) {
      //     this.keySize = keySize / 32;
      //     this.iterationCount = iterationCount;
      //   };
      // },

      makeKey(keySize, iterationCount) {
        this.keySize = keySize / 32;
        this.iterationCount = iterationCount;
      },

      // generateKey(salt, passPhrase) {
      //   var key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), { keySize: this.keySize, iterations: this.iterationCount });
      //   return key;
      // },
      generateKey(keySize, iterationCount, salt, passPhrase) {
        const key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), { keySize: keySize, iterations: iterationCount });
        return key;
      },

      encrypt(pkeySize, piterationCount, salt, iv, passPhrase, plainText) {
        const keySize = pkeySize / 32;
        const iterationCount = piterationCount;
        var key = this.generateKey(keySize, iterationCount, salt, passPhrase);
        var encrypted = CryptoJS.AES.encrypt(plainText, key, { iv: CryptoJS.enc.Hex.parse(iv) });
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      },

      decrypt(salt, iv, passPhrase, cipherText) {
        var key = this.generateKey(salt, passPhrase);
        var cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Base64.parse(cipherText),
        });
        var decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv: CryptoJS.enc.Hex.parse(iv) });
        return decrypted.toString(CryptoJS.enc.Utf8);
      },
    });
  }
);

// var AesUtil = function(keySize, iterationCount) {
//   this.keySize = keySize / 32;
//   this.iterationCount = iterationCount;
// };

// AesUtil.prototype.generateKey = function(salt, passPhrase) {
//   var key = CryptoJS.PBKDF2(
//       passPhrase,
//       CryptoJS.enc.Hex.parse(salt),
//       { keySize: this.keySize, iterations: this.iterationCount });
//   return key;
// }

// AesUtil.prototype.encrypt = function(salt, iv, passPhrase, plainText) {
//   var key = this.generateKey(salt, passPhrase);
//   var encrypted = CryptoJS.AES.encrypt(
//       plainText,
//       key,
//       { iv: CryptoJS.enc.Hex.parse(iv) });
//   return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
// }

// AesUtil.prototype.decrypt = function(salt, iv, passPhrase, cipherText) {
//   var key = this.generateKey(salt, passPhrase);
//   var cipherParams = CryptoJS.lib.CipherParams.create({
//     ciphertext: CryptoJS.enc.Base64.parse(cipherText)
//   });
//   var decrypted = CryptoJS.AES.decrypt(
//       cipherParams,
//       key,
//       { iv: CryptoJS.enc.Hex.parse(iv) });
//   return decrypted.toString(CryptoJS.enc.Utf8);
// }
