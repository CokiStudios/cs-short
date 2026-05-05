const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory storage
const urlMap = new Map();

function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

app.post('/api/shorten', (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
        return res.json({ success: false, message: 'URL is required' });
    }

    try {
        new URL(longUrl);
    } catch {
        return res.json({ success: false, message: 'Invalid URL' });
    }

    let shortCode = generateShortCode();
    while (urlMap.has(shortCode)) {
        shortCode = generateShortCode();
    }

    urlMap.set(shortCode, longUrl);

    res.json({
        success: true,
        longUrl,
        shortCode
    });
});

app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const longUrl = urlMap.get(shortCode);

    if (longUrl) {
        res.redirect(longUrl);
    } else {
        res.status(404).send('URL not found');
    }
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
