const video = document.getElementById("video")

const webCamShow = () => {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    }).then ((stream) => {video.srcObject = stream})
    .catch ((error) => console.log(error))
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
    faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
    faceapi.nets.ageGenderNet.loadFromUri("/weights"),
  ]).then(webCamShow);

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
  
    faceapi.matchDimensions(canvas, { height: video.height, width: video.width });
  
    setInterval(async () => {
      const detection = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions().withAgeAndGender();
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  
      const resizedWindow = faceapi.resizeResults(detection, {
        height: video.height,
        width: video.width,
      });
  
      faceapi.draw.drawDetections(canvas, resizedWindow);
      faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
      faceapi.draw.drawFaceExpressions(canvas, resizedWindow);
  
      resizedWindow.forEach((detection) => {
        const box = detection.detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: Math.round(detection.age) + " year " + detection.gender,
        });
        drawBox.draw(canvas);
      });
  
    //   console.log(detection);
    }, 100);
  });