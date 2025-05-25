require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path'); // Add path module

const app = express();
const PORT = process.env.PORT || 3000;

// --- Server Configuration ---
// 1. Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 3. Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Main Route ---
// This route will render our Vue application
app.get('/', (req, res) => {
  res.render('index'); // Renders views/index.ejs
});


// --- Nodemailer Transporter (same as before) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- API Endpoint (same as before) ---
app.post('/send-wishes', (req, res) => {
  const { resolutions, prayers, recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ message: 'Recipient email is missing!' });
  }

  // Construct the Email Body (HTML format)
  let emailBody = `<h1>Malam Diana,</h1><p>Happy 21st Birthday! 🎉</p>`;
  if (resolutions && resolutions.length > 0) {
    emailBody += "<h2>Keinginan kamu di umur 21</h2><ul>";
    resolutions.forEach(res => { emailBody += `<li>${res}</li>`; });
    emailBody += "</ul>";
  }
  if (prayers && prayers.length > 0) {
    emailBody += "<h2>Doa kamu di birthday 21st</h2><ul>";
    prayers.forEach(prayer => { emailBody += `<li>${prayer}</li>`; });
    emailBody += "</ul>";
  }
  emailBody += "<p>Yuk kita raih bareng-bareng!<br><br>love you,<br>Rayhun</p>";

  const mailOptions = {
    from: `"Rayhun's Birthday App" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Dianas's 21st Year Keinginan & Doa!",
    html: emailBody,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send the email.' });
    }
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});


// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(process.env.EMAIL_PASS);
  console.log(process.env.EMAIL_USER);
});