const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 3000;
const BASE_DIR = __dirname;
const APPOINTMENTS_FILE = path.join(BASE_DIR, 'appointments.txt');

// Проверка и создание файла appointments.txt, если его нет
if (!fs.existsSync(APPOINTMENTS_FILE)) {
    fs.writeFileSync(APPOINTMENTS_FILE, '');
}

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    if (req.method === 'GET') {
        if (pathname === '/mypage' || pathname === '/') {
            serveFile(res, path.join(BASE_DIR, 'page1.html'));
        } else if (pathname === '/page2.html') {
            serveFile(res, path.join(BASE_DIR, 'page2.html'));
        } else if (pathname.startsWith('')) {
            serveStaticFile(res, path.join(BASE_DIR, pathname));
        } else {
            redirectToMypage(res);
        }
    } else if (req.method === 'POST' && pathname === '/new_entry') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const formData = querystring.parse(body);
            const entry = `${Date.now()}_-_${formData.surname} ${formData.name} ${formData.patronymic}_-_${formData.pet_name}_-_${formData.pet_breed}_-_${formData.appointment_date}\n`;
            fs.appendFile(APPOINTMENTS_FILE, entry, err => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Ошибка сервера');
                } else {
                    res.writeHead(302, { 'Location': '/page2.html' });
                    res.end();
                }
            });
        });
    } else {
        redirectToMypage(res);
    }
});

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл не найден');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
}

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    const contentType = {
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif'
    }[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Файл не найден');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function redirectToMypage(res) {
    res.writeHead(302, { 'Location': '/mypage' });
    res.end();
}

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});