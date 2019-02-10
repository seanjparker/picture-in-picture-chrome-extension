// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Modified by Sean
//  - Enables the DOM to be watched for video attribute mutation

if (!document.pictureInPictureEnabled) {
  chrome.browserAction.setTitle({ title: 'Picture-in-Picture NOT supported' });
} else {
  chrome.browserAction.onClicked.addListener(tab => {
    const code = `
      (async () => {

        var loadPIP = async () => {
          const videos = Array.from(document.querySelectorAll('video'))
          .filter(video => video.readyState != 0)
          .filter(video => video.disablePictureInPicture == false)
          .sort((v1, v2) => {
            const v1Rect = v1.getClientRects()[0];
            const v2Rect = v1.getClientRects()[0];
            return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
          });

          if (videos.length === 0)
            return;

          const video = videos[0];

          if (video.hasAttribute('__pip__')) {
            await document.exitPictureInPicture();
          } else {
            await video.requestPictureInPicture();
            video.setAttribute('__pip__', true);
            video.addEventListener('leavepictureinpicture', event => {
              video.removeAttribute('__pip__');
            }, { once: true });
          };
        };

        var targetNode = document.querySelector('video');

        // Options for the observer (which mutations to observe)
        var config = { attributes: true };
      
        // Callback function to execute when mutations are observed
        var callback = async function(mutationsList, observer) {
          for(var mutation of mutationsList) {
            if (mutation.attributeName == 'src') {
              loadPIP();
            }
          }
        };
      
        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);
      
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
        
        loadPIP();

        })()`;
    chrome.tabs.executeScript({ code, allFrames: true });
  });
}
