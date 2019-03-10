var getVideo = () => {
  const videos = Array.from(document.querySelectorAll('video'))
    .filter(video => video.readyState != 0)
    .filter(video => video.disablePictureInPicture == false)
    .sort((v1, v2) => {
      const v1Rect = v1.getClientRects()[0];
      const v2Rect = v1.getClientRects()[0];
      return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
    });

  if (videos.length === 0) return 'undefined';

  return videos[0];
};

var startPIP = async () => {
  const video = getVideo();
  if (video === 'undefined') return;

  if (video.hasAttribute('__pip__')) {
    await document.exitPictureInPicture();
  } else {
    await video.requestPictureInPicture();
    video.setAttribute('__pip__', true);
    video.addEventListener('leavepictureinpicture', event => {
      video.removeAttribute('__pip__');
    }, {
      once: true
    });
  };
};
// Callback function to execute when mutations are observed
var callback = async function (mutationsList, observer) {
  for (var mutation of mutationsList) {
    if (mutation.attributeName == 'src') {
      setTimeout(async () => {
        await startPIP();
      }, 5000);
    }
    //console.log('The ' + mutation.attributeName + ' attribute was modified.');
    return;
  }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

var targetNode = document.querySelector('video');
// Start observing the target node for configured mutations
observer.observe(targetNode, {
  attributes: true
});

startPIP();