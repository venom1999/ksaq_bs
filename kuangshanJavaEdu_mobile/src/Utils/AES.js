import { NativeModules, Platform } from 'react-native'


const CryptoJS = require('crypto-js');  //引用AES源码js

const key = CryptoJS.enc.Utf8.parse("shirleyLshirleyL");  //十六位十六进制数作为密钥
// const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   //十六位十六进制数作为密钥偏移量
export default class AES {
    static Decrypt(word) {
        // let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        // let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        // let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        // let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        // return decryptedStr.toString();
        let decrypt = CryptoJS.AES.decrypt(word, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypt).toString();
    }

//加密方法
//     static Encrypt(word) {
//         let srcs = CryptoJS.enc.Utf8.parse(word);
//         let encrypted = CryptoJS.AES.encrypt(srcs, key, {  mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
//         return encrypted.ciphertext.toString().toUpperCase();
//     }
    static Encrypt(word) {
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
        let hexStr = encrypted.ciphertext.toString().toUpperCase();
        let oldHexStr = CryptoJS.enc.Hex.parse(hexStr);
        let base64Str = CryptoJS.enc.Base64.stringify(oldHexStr);
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    }
    static encryptURL(url) {
        let par=this.getURLParamsObject(url)
        for(let key in par){
            par[key]=this.Encrypt(par[key])
        }
        return url.indexOf('?')>-1?url.substring(0,url.indexOf('?')):url+this.getURLParams(par)
    }
    static getURLParams(data){
        if (!data || Object.keys(data).length === 0) {
            return ''
        }
        return '?' + Object.keys(data).map(key => `${key}=${data[key]?data[key]:''}`).join('&')
    }
    static getURLParamsObject(url){
        let params={}
        if (url.indexOf("?") > -1) {
            let str = url.substring(url.indexOf('?')+1);
            let strs = str.split("&");
            for(let i = 0; i < strs.length; i ++) {
                params[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
            }
        }
        return params;
    }
}


