const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Đường dẫn đến file key.json
const filePath = path.join(__dirname, 'key.json');

// Load dữ liệu từ file key.json
function loadKeys() {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return []; // Trả về mảng rỗng nếu file không tồn tại
}

// Lưu dữ liệu vào file key.json
function saveKeys(data) {
    console.log("[✅] Updated HWID");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// API cập nhật hwid cho key
app.post('/updatehwid', (req, res) => {
    const { key, hwid } = req.body;

    if (!key || !hwid) {
        return res.status(400).json({ message: 'Key và hwid là bắt buộc!' });
    }

    let keysData = loadKeys();
    let keyFound = false;

    // Kiểm tra xem key có tồn tại không và cập nhật hwid nếu hwid hiện tại là null
    for (let entry of keysData) {
        if (entry.key === key) {
            if (entry.hwid === null) { // Kiểm tra hwid hiện tại
                entry.hwid = hwid; // Cập nhật hwid cho key
                keyFound = true; // Đánh dấu là đã tìm thấy key
            } else {
                return res.status(400).json({ message: 'HWID đã tồn tại cho key này!' }); // Trả về lỗi nếu hwid đã tồn tại
            }
            break;
        }
    }

    if (keyFound) {
        saveKeys(keysData);
        res.json({ message: '[✅] Key Found' });
    } else {
        res.status(404).json({ message: 'Key không hợp lệ' });
    }
});

// API lấy dữ liệu từ key.json
app.get('/getkeys', (req, res) => {
    const keysData = loadKeys();
    res.json(keysData); // Trả về dữ liệu từ file key.json
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
