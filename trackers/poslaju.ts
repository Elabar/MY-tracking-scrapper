import puppeteer from "puppeteer";

const formatPoslajuTracking = (trackingNo: string[]) => {
  return trackingNo.map((v) => v.trim()).join(";");
};

export const trackPoslaju = async (trackingNo: string[]) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.pos.com.my/`, {
    waitUntil: "networkidle2",
  });

  const formattedTracking = formatPoslajuTracking(trackingNo);
  const outerTrackButton = await page.$('li[value="widgetTrackAndTrace"]');
  await outerTrackButton?.click();
  const trackingTextArea = await page.$(
    'textarea[class="trackSearchInput"][id="w3mission"]'
  );
  await trackingTextArea?.focus();
  await trackingTextArea?.type(formattedTracking);

  const nextButton = await page.$(
    'button[id="homeTrackSearchBtnId"][class="homeTrackSearchButton"]'
  );
  await nextButton?.click();
  await page.waitForSelector('div[class="panel panel-default"]');
  const allTrackingBoxes = (await page?.$$("div.panel.panel-default")) || [];
  let results = [];
  for (const trackingBox of allTrackingBoxes) {
    const rawStatusBoxes = await trackingBox.$$(
      "div.trackingList div.trackingItem"
    );
    let statuses = [];
    let found = true;
    const billAbox = await trackingBox.$(
      "div.panel-heading h4.panel-title a.accordion-toggle"
    );
    const trackingNumber = await (
      await billAbox?.getProperty("textContent")
    )?.jsonValue<string>();
    if (rawStatusBoxes.length === 0) {
      break;
    }
    for (const box of rawStatusBoxes) {
      const datetimeBoxes = await box.$$("div.trackingDate span");
      let timestamp = "";
      for (const timestampBox of datetimeBoxes) {
        const text = await (
          await timestampBox.getProperty("textContent")
        )?.jsonValue<string>();
        timestamp += text + " ";
      }
      const trackingContentBox = await box.$("div.trackingContent span");
      const status = await (
        await trackingContentBox?.getProperty("textContent")
      )?.jsonValue<string>();
      if (status === "No record found") {
        found = false;
        break;
      }
      statuses.push({
        timestamp: timestamp.trim(),
        status,
      });
    }
    results.push({
      tracking: trackingNumber,
      statuses,
      found,
    });
  }
  return results;
};
