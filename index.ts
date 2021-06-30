import { trackJNT } from "./trackers/jnt";
import { trackPoslaju } from "./trackers/poslaju";

const start = async () => {
  const jntTrackings = ["630367278709", "630367278692"];
  console.time("get_jnt_time");
  console.log(`Getting J&T tracking with: ${jntTrackings}`);
  const JNTResult = await trackJNT(jntTrackings);
  console.log(JSON.stringify(JNTResult, null, 2));
  console.timeEnd("get_jnt_time");

  const poslajuTrackings = ["PL764441620465", "PL002889373280"];
  console.time("get_poslaju_time");
  console.log(`Getting PosLaju tracking with: ${poslajuTrackings}`);
  const poslajuResult = await trackPoslaju(poslajuTrackings);
  console.log(JSON.stringify(poslajuResult, null, 2));
  console.timeEnd("get_poslaju_time");
};

start();
