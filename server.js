// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// receipts file (simple JSON store for demo)
const DATA_FILE = path.join(__dirname, 'receipts.json');

function readReceipts() {
  try {
    const s = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(s || '[]');
  } catch (err) {
    return [];
  }
}
function writeReceipts(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// ensure file exists
if (!fs.existsSync(DATA_FILE)) writeReceipts([]);

// demo route to process payment
app.post('/pay', async (req, res) => {
  try {
    const { name, email, card, expiry, cvc, bookId, amount } = req.body;

    if (!name || !email || !bookId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // --- SIMULATED PAYMENT PROCESSING ---
    // In a real system: create payment token/client token using gateway SDK,
    // then create payment intent on the server using the gateway's API (Stripe, PayPal).
    // Here we will simulate success unless card equals "4000 0000 0000 0002" which we will treat as a failed card.

    await delay(800); // simulate network/processing

    if (typeof card === 'string' && card.includes('4000 0000 0000 0002')) {
      return res.status(402).json({ error: 'Card was declined (simulated)' });
    }

    // create receipt
    const receipt = {
      id: uuidv4(),
      name,
      email,
      bookId,
      bookTitle: 'Data Science for Beginners',
      amount: Number(amount),
      date: new Date().toISOString(),
      status: 'paid'
    };

    const receipts = readReceipts();
    receipts.push(receipt);
    writeReceipts(receipts);

    return res.json({ success: true, receipt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/receipts', (req, res) => {
  res.json(readReceipts());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
