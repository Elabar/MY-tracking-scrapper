import puppeteer from "puppeteer";

const formatJNTTracking = (trackingNo: string[]) => {
  return trackingNo.map((v) => v.trim()).toString();
};

export const trackJNT = async (trackingNo: string[]) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.jtexpress.my/track.php?awbs=${formatJNTTracking(trackingNo)}`,
    {
      waitUntil: "networkidle2",
    }
  );

  const resultBox = await page.$(
    'div[class="track-and-trace-details"][id="myDIV"]'
  );
  const allTrackingBoxes = (await resultBox?.$$("div.margin-top-10px")) || [];
  let results = [];
  for (const trackingBox of allTrackingBoxes) {
    const rawStatusBoxes = await trackingBox.$$(
      "div.tracking-result-box-right-inner"
    );
    const billBox = await trackingBox.$(
      'button[type="button"].tracking-title.collapsible'
    );
    const trackingNumber = await (
      await billBox?.getProperty("textContent")
    )?.jsonValue<string>();
    let statuses = [];
    let found = rawStatusBoxes.length > 0;
    for (const box of rawStatusBoxes) {
      const timeBox = await box.$('div[class="tracking-point-date-time"]');
      const dateBox = await box.$(
        'div[class="tracking-point-date-time tracking-date"]'
      );
      const statusBox = await box.$("div.tracking-point-details span");
      const time = await (
        await timeBox?.getProperty("textContent")
      )?.jsonValue<string>();
      const date = await (
        await dateBox?.getProperty("textContent")
      )?.jsonValue<string>();
      const status = await (
        await statusBox?.getProperty("textContent")
      )?.jsonValue<string>();

      statuses.push({
        timestamp: `${time?.trim()}, ${date
          ?.trim()
          .replace(/ /g, "")
          .replace(/\r?\n|\r/g, " ")}`,
        status: status,
      });
    }
    if (trackingNumber) {
      results.push({
        tracking: trackingNumber?.trim().replace("Airwaybill No: ", ""),
        statuses: statuses,
        found,
      });
    }
  }

  return results;
};
