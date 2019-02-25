function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

playerManager.setMessageInterceptor(
    cast.framework.messages.MessageType.LOAD,
    request => {
      console.log("Intercepting LOAD request")
      return new Promise((resolve, reject) => {
        // Fetch content repository by requested contentId
        makeRequest('GET', 'http://rtmp.cdn.ua/1zahid.com_live/_definst_/livestream/playlist.m3u8').then(function (data) {
          var item = data[request.media.contentId];
          if(!item) {
            // Content could not be found in repository
            reject();
          } else {
            // Adjusting request to make requested content playable
            request.media.contentId = item.stream.hls;
            request.media.contentType = 'application/x-mpegurl';

            // Add metadata
            var metadata = new 
               cast.framework.messages.GenericMediaMetadata();
            metadata.title = item.stream.hls; //item.title
            metadata.subtitle = item.author;

            // Resolve request
            resolve(request);
          }
        });
      });
    });
