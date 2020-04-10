import AES from "./AES";

export default class HttpUtils {
    static PostFetch(url,params) {
      return fetch(url,{
            method: 'POST',
            body:params
        })
            .then((response) => response.text())
            .then(function (responseText) {
                return AES.Decrypt(responseText)
            }).then(function (data) {
                return JSON.parse(data)
          }
        )
            .catch((error) => {
                console.error(error);
            });
    }
}
