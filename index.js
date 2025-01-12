import { exec } from "child_process";
import fs from "fs";
import ytdl from "@distube/ytdl-core";
import Express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import ffmpeg from "ffmpeg";
import { spawn } from "child_process";
import dotenv from "dotenv";
dotenv.config();
const cookies = {
  VISITOR_INFO1_LIVE: "05fCaGuGY98",
  VISITOR_PRIVACY_METADATA: "CgJJThIEGgAgLw%3D%3D",
  GPS: "1",
  "__Secure-ROLLOUT_TOKEN": "CKOg3K379deGvwEQ7pzE9N_vigMY7pzE9N_vigM%3D",
  YSC: "m1pm1qy8eXc",
  LOGIN_INFO:
    "AFmmF2swRQIhAI-i2mqdEuqULG8nBqj5qlKjK1aUnWOlqS1hQ5SPx47TAiAfl3ATdS1iSEOOy2aIng-Leo5_Go-g-Vr96Rr3BiG9Mg:QUQ3MjNmeDBpbTdVQzlnSzVYbXpjdE5PUW9ZMVhsOTE2UFhxeXJoSTlpbnpYVzF0a0hJWDBSMG05aDJ0X2lwb3RxbTVtWkNnY0V5cnlhTkViR0JSYnhCbm9TYkVITzdWbWtDWXA2SFl0NG04eDlRMUhKWUI3cXNzRFpMOENOSDU1Tk5VQVAxb1RMV0NaeDhiQnRhYVhFSW5aVEMwRnRHM3lR",
  "__Secure-1PSIDTS":
    "sidts-CjEBmiPuTZmJWlMbyeDsk8tDKwnxqcRzjQrtE2tQAhGxZQrdQF0ZbkL0znsMyVXnTdwDEAA",
  "__Secure-3PSIDTS":
    "sidts-CjEBmiPuTZmJWlMbyeDsk8tDKwnxqcRzjQrtE2tQAhGxZQrdQF0ZbkL0znsMyVXnTdwDEAA",
  HSID: "A1OXVLZ-9oyvkOce0",
  SSID: "AZmKTWGFJ8pD6ADEU",
  APISID: "HQEo-x0LxIqIozYQ/A9HGHykD4WBmPze4z",
  SAPISID: "XkIvCKqpEfSEc0QS/AINkop3FNyCYET-RK",
  "__Secure-1PAPISID": "XkIvCKqpEfSEc0QS/AINkop3FNyCYET-RK",
  "__Secure-3PAPISID": "XkIvCKqpEfSEc0QS/AINkop3FNyCYET-RK",
  SID: "g.a000sQhIiPoQPRl2q-GTIsgsyBKt5UIAZCeRWWXeUd_V6JFkRF8i8fxiFizCLotOk6jJHYD7cQACgYKAVwSARISFQHGX2Mi-2W7vIYOvdud5abArlYrbBoVAUF8yKo6hIxxQYShFMBV3efGyDN-0076",
  "__Secure-1PSID":
    "g.a000sQhIiPoQPRl2q-GTIsgsyBKt5UIAZCeRWWXeUd_V6JFkRF8i1Anurv40pzZdE4DT4nsaqAACgYKASISARISFQHGX2Mi7w5RWr_Nh7tGYQ5Fjmsa-RoVAUF8yKoyXIvPz6Rzcfy63s3i5-W90076",
  "__Secure-3PSID":
    "g.a000sQhIiPoQPRl2q-GTIsgsyBKt5UIAZCeRWWXeUd_V6JFkRF8idfJQn0osdFK0Was9znzXJQACgYKAfsSARISFQHGX2Miw-lHkRF3VUWFL2t8yuPMuBoVAUF8yKoM0GvxJ4yf_E406o1WpZZL0076",
  PREF: "tz",
  SIDCC:
    "AKEyXzUqDglcjKkphfYXKB87a7cz4TStV0qMqeq5WC9PLn9jqArzYn3GfRxmVNHw3BONcJRA",
  "__Secure-1PSIDCC":
    "AKEyXzXaPcDZu4_NJuLuq5X3Zj5qR9AFWtLMCFxAzayjUdU3gA6obzE3-pO8bIfiTsIMP2K7",
  "__Secure-3PSIDCC":
    "AKEyXzXoVcitqj-z64NiLX5-U-Abtx9OYryhDjeUAvfWuU8vqrCo1Xz7GC4f5gOM7ZBzBTQEEA",
  "ST-1b": "session_logininfo",
};
const agent = ytdl.createAgent(cookies);
const app = Express();
const port = process.env.PORT || 3200;
const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors());
app.use(Express.json()); // 2
app.use(
  Express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser("secret123"));
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      sameSite: true,
      secure: false,
      maxAge: 60 * 1000,
    },
  })
);
const sessions = [];
// const command =
//   "ffmpeg -i video.mp4 -i audio.webm -c:v copy -c:a aac output.mp4";
// exec(command, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.error(`stderr: ${stderr}`);
// });
let downloadFile = async function (
  url,
  format1,
  position,
  flag,
  sessionYTDL,
  extension = "mp4"
) {
  let strFile = "";
  if (flag === true) strFile += "video" + position.toString() + "." + extension;
  else if (flag === false)
    strFile += "audio" + position.toString() + "." + extension;
  else strFile += "final" + position.toString() + "." + extension;
  let res = await ytdl(url, { format: format1 })
    .pipe(fs.createWriteStream(strFile))
    .on("close", () => {
      console.log("Done" + position + " " + strFile);
      if (flag === true) sessionYTDL.videoReady = true;
      else if (flag === false) sessionYTDL.audioReady = true;
      else sessionYTDL.audiovideoReady = true;
    })
    .on("error", (err) => console.log(err));
  return strFile;
};
app.post("/getInfo", async (req, res) => {
  // if (sessions.length > 20)
  //   res.send({ message: "Too many users on site, please try back later..." });
  let sessionYTDL;
  if (!req.sessionYTDL) {
    let randomKey = Math.round(Math.random() * 999999999) + 999999999;
    sessionYTDL = {
      position: sessions.length + 1,
      key: randomKey,
      url: req.body.url,
      id: null,
      isReady: false,
      creationTime: Date.now(),
      finalURL: "",
    };
    req.sessionYTDL = sessionYTDL;
    sessions.push(sessionYTDL);
  } else {
    req.sessionYTDL.url = req.body.url;
    let position = sessions.length;
    req.sessionYTDL.position = position;
  }
  try {
    console.log(req.sessionYTDL);
    let id = ytdl.getURLVideoID(req.sessionYTDL.url, { agent });
    console.log("id=", id);
    let info = ytdl.getInfo(req.sessionYTDL.url, { agent }); //(id);
    console.log("info=", info);
    sessionYTDL.id = id;
    sessionYTDL.creationTime = Date.now();
    sessionYTDL.info = info;
    let sendingInfo = {};
    sendingInfo.videoDetails = {};
    sendingInfo.videoDetails.title = info.videoDetails.title;
    sendingInfo.videoDetails.lengthSeconds = info.videoDetails.lengthSeconds;
    sendingInfo.videoDetails.description = info.videoDetails.description;
    sendingInfo.videoDetails.uploadDate = info.videoDetails.uploadDate;
    sendingInfo.videoDetails.likes = info.videoDetails.likes;
    sendingInfo.videoDetails.dislikes = info.videoDetails.dislikes;
    sendingInfo.videoDetails.ownerChannelName =
      info.videoDetails.ownerChannelName;
    sendingInfo.videoDetails.author = info.videoDetails.author;
    sendingInfo.formats = [];
    for (let i = 0; i < info.formats.length; i++) {
      let t = {};
      let format = info.formats[i];
      t.mimetype = format.mimeType;
      t.qualityLabel = format.qualityLabel;
      t.hasVideo = format.hasVideo;
      t.hasAudio = format.hasAudio;
      t.container = format.container;
      t.itag = format.itag;
      t.audioQuality = format.audioQuality;
      sendingInfo.formats.push(t);
    }
    req.sessionYTDL.formats = info.formats;
    sendingInfo.key = req.sessionYTDL.key;
    res.send(sendingInfo);
  } catch (err) {
    res.send({ message: JSON.stringify(err) });
  }
});
app.get("/downloadWithURL/:url", async (req, res) => {
  let url = req.params.url;
  let flag = true;
  console.log("Requested " + url);
  const __dirname = path.dirname(url);
  const filePath = url; //path.join(__dirname) + "/" + url;
  console.log("File path=" + filePath);
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].finalURL == url) {
      if (
        sessions[i].isReady &&
        !sessions[i].downloaded &&
        !sessions[i].isDownloading
      ) {
        sessions[i].isDownloading = true;
        flag = false;
        res.download(filePath, url, (err) => {
          if (err) {
            res.status(500).send({
              message: "Could not download the file. " + err,
            });
            sessions[i].isDownloading = false;
          }
          flag = false;
          sessions[i].downloaded = true;
        });
      }
    }
  }
  if (flag)
    res.status(500).send({
      message: "Could not download the file. ",
    });
});
app.post("/downloadWithInfo", async (req, res) => {
  console.log(req.body.key);
  if (sessions.length == 0)
    res.send({
      message:
        "Initiate a request for video format first as your token expired...",
    });
  sessions.forEach(async (session) => {
    if (session.key == req.body.key) {
      let format1;
      let itags = req.body.itags;
      if (itags.commontag) {
        let itag = itags.commontag;
        let strFinal = "final" + req.body.key + ".mp4";
        res.send({ url: strFinal });
        format1 = ytdl.chooseFormat(session.info.formats, {
          quality: itag,
          agent,
        });
        console.log("Session for commmon = " + session.key);
        await downloadFile(
          session.url,
          format1,
          req.body.key,
          "common",
          session
        );
        let checkComplete = function () {
          if (session.audiovideoReady) {
            session.isReady = true;
            session.finalURL = strFinal;
          }
        };
        setInterval(checkComplete, 5000);
      } else {
        let movieitag = itags.movieitag;
        let audioitag = itags.audioitag;
        try {
          let extension = "";

          let formatVideo = ytdl.chooseFormat(session.info.formats, {
            quality: movieitag,
            agent,
          });
          let formatAudio = ytdl.chooseFormat(session.info.formats, {
            quality: audioitag,
            agent,
          });
          extension =
            formatVideo.container != formatAudio.container ? "mkv" : "mp4";
          let strFinal = "final" + req.body.key + "." + extension;
          res.send({ url: strFinal });
          let videoFile, audioFile;
          downloadFile(
            session.url,
            formatVideo,
            req.body.key,
            true,
            session,
            formatVideo.container
          )
            .then((dataVideodl) => {
              videoFile = dataVideodl;
              downloadFile(
                session.url,
                formatAudio,
                req.body.key,
                false,
                session,
                formatAudio.container
              )
                .then((dataAudiodl) => {
                  audioFile = dataAudiodl;
                  let command =
                    "ffmpeg -i " +
                    videoFile +
                    " -i " +
                    audioFile +
                    "  -c copy -strict -2 " +
                    strFinal;
                  var handle;
                  let delayedCommand = function () {
                    // let command = ffmpeg();
                    // command.addInput();
                    // command.addInput();
                    // command.addOptions(["v:1", "a:1"]);
                    // let input_video = ffmpeg().input("./" + videoFile);
                    // let input_audio = ffmpeg().input("./" + audioFile);

                    // command
                    //   .concat("./" + videoFile, "./" + audioFile)
                    //   .output(strFinal)
                    //   .on("end", () => {
                    //     session.isReady = true;
                    //     session.finalURL = strFinal;
                    //   })
                    //   .on("error", (err) => console.log(err))
                    //   .run();
                    if (session.audioReady && session.videoReady) {
                      console.log("Starting commmand now-" + command);
                      clearInterval(handle);
                      //   const child = exec(command);
                      //   process.stdin.pipe(child.stdin);
                      //   child.stdout.on("data", (data) => {
                      //     console.log(`child stdout:\n${data}`);
                      //   });
                      //   child.on("exit", function (code, signal) {
                      //     console.log(
                      //       "child process exited with " +
                      //         `code ${code} and signal ${signal}`
                      //     );

                      //     session.isReady = true;
                      //     session.finalURL = strFinal;
                      //   });
                      //   child.on("error", (err) => {
                      //     console.log(
                      //       "----------- ERROR IN CONCATENATING FILES --------------"
                      //     );
                      //     console.log(err);
                      //   });
                      // }
                      exec(command, (error, stdout, stderr) => {
                        if (error) {
                          console.error(`exec error: ${error}`);
                          session.message = error;
                          // res.send({ message: "Error in processing file..." });
                          return;
                        } else {
                          console.log(`stdout: ${stdout}`);
                          console.error(`stderr: ${stderr}`);
                          session.isReady = true;
                          session.finalURL = strFinal;

                          // const __dirname = path.dirname("./");
                          // const directoryPathVideo =
                          //   path.join(__dirname) + "/" + videoFile;
                          // const directoryPathAudio =
                          //   path.join(__dirname) + "/" + audioFile;
                          // fs.unlinkSync(directoryPathVideo);
                          // fs.unlinkSync(directoryPathAudio);
                        }
                      });
                    }
                  };
                  handle = setInterval(delayedCommand, 3000);
                })
                .catch((err) =>
                  console.log("Error in downloading audio " + err)
                );
            })
            .catch((err) => console.log("Error in downloading video " + err));
        } catch (err) {
          session.message = err;
        }
      }
      // } else {
      //   if (sessions.length > 0) {
      //     let flag = false;
      //     sessions.forEach((x) => {
      //       if (x.key == req.body.key) flag = true;
      //     });
      //     if (flag) res.send({ message: "Please Wait, you are in queue..." });
      //     else res.send({ message: "Invalid token or session expired!" });
      //   }
    }
  });
});
// downloadFile("https://www.youtube.com/watch?v=v8ueA9FNb0U");
app.listen(port, () => console.log("Started at port " + port));

// setInterval(() => {
//   if (sessions.length > 0) {
//     let key = sessions[0].key;
//     const __dirname = path.dirname("./");
//     fs.readdir(__dirname, (err, files) => {
//       if (err) console.log(err);
//       files.forEach(function (file) {
//         let str1 = file.split(".")[0];
//         if (str1.includes(key)) {
//           fs.unlinkSync(file);
//         }
//       });
//     });
//     let now = Date.now();
//     if (now - session.creationTime > 1000000) sessions.splice(0, 1);
//   }
// }, 40000);
let deleteFile = function () {
  //if (sessions.length > 25) sessions.splice(0, 1);
  console.log(sessions.length);
  const __dirname = path.dirname("./");
  fs.readdir(__dirname, (err, files) => {
    if (err) console.log(err);
    files.forEach(function (file) {
      try {
        if (
          file.endsWith(".mkv") ||
          file.endsWith("webm") ||
          file.endsWith("mp4")
        ) {
          fs.stat(file, (err, stats) => {
            let now = Date.now();
            if (err) {
              console.log(err);
              return;
            }
            if (stats)
              if (now - stats.ctimeMs > 200000) {
                try {
                  fs.unlinkSync(file);
                } catch (err) {
                  console.log(
                    "Error in deleting file " + file + " with error: " + err
                  );
                }
              }
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
  });
};
setInterval(deleteFile, 15000);
