const path = require("path");
const fs = require("fs");

/**
 * Executes a high-fidelity E2E interaction step on the FluentVoice app.
 * @param {WebdriverIO.Browser} driver The driver/browser session
 * @param {number} stepNum The test step sequence index (1-16)
 * @param {string} screenshotDir Directory to save execution screenshots
 */
async function executeRealE2EStep(driver, stepNum, screenshotDir) {
  if (screenshotDir) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const saveScreen = async (filename) => {
    if (screenshotDir) {
      await driver.saveScreenshot(path.join(screenshotDir, filename));
    }
  };

  switch (stepNum) {
    case 1: {
      const orientation = await driver.getOrientation();
      if (!["PORTRAIT", "LANDSCAPE"].includes(orientation)) {
        throw new Error(`Unexpected orientation: ${orientation}`);
      }
      await saveScreen("1_landing_init.png");
      return "Device connection verified and initial screen captured.";
    }
    case 2: {
      const btnPatient = await driver.$("android=new UiSelector().text(\"I'm a Patient\")");
      const isLanding = await btnPatient.isDisplayed().catch(() => false);
      if (isLanding) {
        await btnPatient.click();
        await driver.pause(2000);
      } else {
        const menuBtn = await driver.$("android=new UiSelector().description(\"Menu\")");
        const isDashboard = await menuBtn.isDisplayed().catch(() => false);
        if (isDashboard) {
          await menuBtn.click();
          await driver.pause(1000);
          const signOutBtn = await driver.$("android=new UiSelector().text(\"Sign Out\")");
          await signOutBtn.click();
          await driver.pause(2000);
          const pBtn = await driver.$("android=new UiSelector().text(\"I'm a Patient\")");
          await pBtn.click();
          await driver.pause(2000);
        }
      }
      await saveScreen("2_login_patient_screen.png");
      return "Navigated to Patient Login screen.";
    }
    case 3: {
      const inputs = await driver.$$("android=new UiSelector().className(\"android.widget.EditText\")");
      if (inputs.length < 2) {
        throw new Error(`Expected at least 2 input fields, found ${inputs.length}`);
      }
      return "Patient Login screen input fields verified.";
    }
    case 4: {
      const inputs = await driver.$$("android=new UiSelector().className(\"android.widget.EditText\")");
      await inputs[0].setValue("patient@example.com");
      await inputs[1].setValue("password");
      await driver.pause(1000);
      await saveScreen("3_patient_login_filled.png");
      return "Entered patient credentials.";
    }
    case 5: {
      const btnSignIns = await driver.$$("android=new UiSelector().text(\"Sign in\")");
      if (btnSignIns.length === 0) {
        throw new Error("Sign in button not found");
      }
      await btnSignIns[btnSignIns.length - 1].click();
      return "Clicked Sign in button.";
    }
    case 6: {
      const dashboardText = await driver.$("android=new UiSelector().text(\"Dashboard\")");
      await dashboardText.waitForDisplayed({ timeout: 45000 });
      await saveScreen("4_patient_dashboard.png");
      return "Patient Dashboard loaded successfully.";
    }
    case 7: {
      const menuBtn = await driver.$("android=new UiSelector().description(\"Menu\")");
      await menuBtn.click();
      await driver.pause(1500);
      await saveScreen("5_patient_drawer.png");
      return "Patient navigation drawer opened.";
    }
    case 8: {
      const signOutBtn = await driver.$("android=new UiSelector().text(\"Sign Out\")");
      await signOutBtn.click();
      await driver.pause(2000);
      await saveScreen("6_after_patient_signout.png");
      return "Clicked Sign Out.";
    }
    case 9: {
      const btnPatient = await driver.$("android=new UiSelector().text(\"I'm a Patient\")");
      await btnPatient.waitForDisplayed({ timeout: 5000 });
      return "Returned to Landing screen.";
    }
    case 10: {
      const btnTherapist = await driver.$("android=new UiSelector().text(\"I'm a Therapist\")");
      await btnTherapist.click();
      await driver.pause(2000);
      await saveScreen("7_login_therapist_screen.png");
      return "Clicked I'm a Therapist button.";
    }
    case 11: {
      const inputs = await driver.$$("android=new UiSelector().className(\"android.widget.EditText\")");
      if (inputs.length < 2) {
        throw new Error(`Expected at least 2 input fields, found ${inputs.length}`);
      }
      return "Therapist Login screen fields verified.";
    }
    case 12: {
      const inputs = await driver.$$("android=new UiSelector().className(\"android.widget.EditText\")");
      await inputs[0].setValue("therapist@example.com");
      await inputs[1].setValue("password");
      await driver.pause(1000);
      await saveScreen("8_therapist_login_filled.png");
      return "Entered therapist credentials.";
    }
    case 13: {
      const btnSignIns = await driver.$$("android=new UiSelector().text(\"Sign in\")");
      await btnSignIns[btnSignIns.length - 1].click();
      return "Clicked Sign in button.";
    }
    case 14: {
      const dashboardText = await driver.$("android=new UiSelector().text(\"Dashboard\")");
      await dashboardText.waitForDisplayed({ timeout: 45000 });
      await saveScreen("9_therapist_dashboard.png");
      return "Therapist Dashboard loaded successfully.";
    }
    case 15: {
      const menuBtn = await driver.$("android=new UiSelector().description(\"Menu\")");
      await menuBtn.click();
      await driver.pause(1500);
      await saveScreen("10_therapist_drawer.png");
      return "Therapist navigation drawer opened.";
    }
    case 16: {
      const signOutBtn = await driver.$("android=new UiSelector().text(\"Sign Out\")");
      await signOutBtn.click();
      await driver.pause(2000);
      await saveScreen("11_after_therapist_signout.png");
      return "Clicked Sign Out and completed E2E flow.";
    }
    default:
      return `Step ${stepNum} executed.`;
  }
}

module.exports = { executeRealE2EStep };
