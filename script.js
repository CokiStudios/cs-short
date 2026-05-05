const longUrlInput = document.getElementById('longUrl');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const originalUrlSpan = document.getElementById('originalUrl');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');

// Load history from localStorage
loadHistory();

shortenBtn.addEventListener('click', shortenUrl);
longUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') shortenUrl();
});
copyBtn.addEventListener('click', copyToClipboard);

async function shortenUrl() {
    const url = longUrlInput.value.trim();
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ longUrl: url })
        });

        const data = await response.json();
        
        if (data.success) {
            originalUrlSpan.textContent = data.longUrl;
            shortUrlInput.value = `${window.location.origin}/${data.shortCode}`;
            resultDiv.classList.remove('hidden');
            
            addToHistory(data.longUrl, data.shortCode);
            longUrlInput.value = '';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to shorten URL');
    }
}

function copyToClipboard() {
    shortUrlInput.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy to Clipboard';
    }, 2000);
}

function addToHistory(longUrl, shortCode) {
    const history = JSON.parse(localStorage.getItem('urlHistory')) || [];
    history.unshift({ longUrl, shortCode, date: new Date().toLocaleDateString() });
    
    // Keep only last 10
    if (history.length > 10) history.pop();
    
    localStorage.setItem('urlHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('urlHistory')) || [];
    historyList.innerHTML = history.map((item, i) => `
        <li>
            <div class="history-item-text">
                <strong>${item.shortCode}</strong> → ${item.longUrl.substring(0, 50)}...
                <br><small>${item.date}</small>
            </div>
            <button onclick="copyHistoryItem('${item.shortCode}')">Copy</button>
        </li>
    `).join('');
}

function copyHistoryItem(shortCode) {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    alert('Copied!');
}
