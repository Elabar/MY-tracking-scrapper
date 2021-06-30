import { trackJNT } from "./trackers/jnt";

const jntTrackings = ["630367278709", "630367278692"];

const start = async () => {
  console.time("get_jnt_time");
  console.log(`Getting J&T tracking with: ${jntTrackings}`);
  const JNTResult = await trackJNT(jntTrackings);
  console.log(JSON.stringify(JNTResult, null, 2));
  console.timeEnd("get_jnt_time");
};

start();
