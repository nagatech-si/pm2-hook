const pm2 = require("pm2");
const axios = require("axios");
require("dotenv").config();

// URL server Anda yang akan menerima webhook
const WEBHOOK_URL = process.env.WEBHOOK_SERVER;

// Fungsi untuk mengirim data ke server
const sendWebhook = async (event, data) => {
  const { process, at } = data;
  try {
    var time = new Date(at);
    time.setHours(time.getHours() + 7);
    await axios.get(WEBHOOK_URL, {
      params: {
        message: `*Server Update Info* 🖥️\n\nNama PM2:\n - *${
          process.name
        }*\nID PM2:\n - *${process.pm_id}*\nStatus PM2:\n - *${
          process.status
        }*\nRestart Time:\n - *${time.toISOString()}*`,
      },
    });
    console.log(`Webhook sent for event: ${event}, process: ${process.name}`);
  } catch (error) {
    console.error("Error sending webhook:", error.message);
  }
};

// Connect to PM2
pm2.connect((err) => {
  if (err) {
    console.error("Error connecting to PM2:", err.message);
    process.exit(2);
  }

  console.log("Connected to PM2. Observing events...");

  // Dengarkan semua event PM2
  pm2.launchBus((err, bus) => {
    if (err) {
      console.error("Error launching PM2 bus:", err.message);
      process.exit(2);
    }

    bus.on("process:event", (data) => {
      const { event, process } = data;
      if (event === "restart" || event === "start") {
        console.log(`Detected event: ${event} on process: ${process.name}`);
        sendWebhook(event, data);
      }
    });
  });
});
