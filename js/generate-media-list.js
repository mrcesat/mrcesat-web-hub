const fs = require('fs');
const path = require('path');

function getAllMediaFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllMediaFiles(filePath, fileList);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                // Преобразуем в относительный путь от корня проекта
                const relativePath = filePath.replace(/\\/g, '/').replace(/^.*?cases/, 'cases');
                fileList.push(relativePath);
            }
        }
    });

    return fileList;
}

const mediaFiles = getAllMediaFiles('./cases');
mediaFiles.push('avatar_pic.jpg'); // Добавляем корневые файлы

const jsonData = {
    images: mediaFiles
};

fs.writeFileSync('media-list.json', JSON.stringify(jsonData, null, 2));
console.log(`✅ Создан media-list.json с ${mediaFiles.length} файлами`);
