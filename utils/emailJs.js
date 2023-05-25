const emailjs = require("emailjs");

const server = emailjs.server.connect({
  user: "eshilimarwen9@gmail.com",
  password: "12692344Marwen",
  host: "smtp.gmail.com",
  ssl: true,
});
const sendEmail = async (content) => {
  const message = {
    from: "YOUR_NAME <YOUR_EMAIL_ADDRESS>",
    to: "marwen.shili@polytechnicien.tn",
    subject: "Test Email",
    text: "This is a test email sent from Node.js using EmailJS package.",
  };

  server.send(message, (err, message) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Email sent successfully!");
    }
  });
};
