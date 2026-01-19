// 电视尺寸数据 (16:9比例，单位cm)
const tvSizes = {
    55: { width: 121.8, height: 68.5, diagonal: 139.7 },
    65: { width: 143.9, height: 80.9, diagonal: 165.1 },
    75: { width: 166.0, height: 93.4, diagonal: 190.5 },
    85: { width: 188.2, height: 105.8, diagonal: 215.9 },
    98: { width: 216.9, height: 122.0, diagonal: 248.9 },
    100: { width: 221.4, height: 124.5, diagonal: 254.0 }
};

let currentSize = 75;
let distance = 3.1;
let tvHeight = 1.1;
let eyeHeight = 1.1;
let wallWidth = 3.6;
let wallHeight = 2.7;
let currentVideo = null;
let isFullscreen = false;

let topCanvas, sideCanvas, topCtx, sideCtx;

document.addEventListener('DOMContentLoaded', () => {
    topCanvas = document.getElementById('topViewCanvas');
    sideCanvas = document.getElementById('sideViewCanvas');
    topCtx = topCanvas.getContext('2d');
    sideCtx = sideCanvas.getContext('2d');

    resizeCanvases();
    setupEventListeners();
    updateAll();

    // 页面加载完成后自动播放视频
    loadVideo();

    window.addEventListener('resize', () => {
        resizeCanvases();
        updateAll();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFullscreen) {
            toggleFullscreen();
        }
    });
});

function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;
    
    [topCanvas, sideCanvas].forEach(canvas => {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 250 * dpr;
        canvas.style.height = '250px';
        canvas.getContext('2d').scale(dpr, dpr);
    });
}

function setupEventListeners() {
    document.getElementById('distance').addEventListener('input', (e) => {
        distance = parseFloat(e.target.value);
        document.getElementById('distanceValue').textContent = distance.toFixed(1) + '米';
        updateAll();
    });

    document.getElementById('wallWidth').addEventListener('input', (e) => {
        wallWidth = parseFloat(e.target.value);
        document.getElementById('wallWidthValue').textContent = wallWidth.toFixed(1) + '米';
        updateAll();
    });

    document.getElementById('wallHeight').addEventListener('input', (e) => {
        wallHeight = parseFloat(e.target.value);
        document.getElementById('wallHeightValue').textContent = wallHeight.toFixed(1) + '米';
        updateAll();
    });

    document.getElementById('tvHeight').addEventListener('input', (e) => {
        tvHeight = parseFloat(e.target.value);
        document.getElementById('tvHeightValue').textContent = tvHeight.toFixed(2) + '米';
        updateAll();
    });

    document.getElementById('eyeHeight').addEventListener('input', (e) => {
        eyeHeight = parseFloat(e.target.value);
        document.getElementById('eyeHeightValue').textContent = eyeHeight.toFixed(2) + '米';
        updateAll();
    });

    // 人像开关
    document.getElementById('humanToggle').addEventListener('change', (e) => {
        const humanRef = document.getElementById('humanRef');
        if (e.target.checked) {
            humanRef.classList.add('visible');
        } else {
            humanRef.classList.remove('visible');
        }
    });

    document.querySelectorAll('.tv-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tv-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.dataset.size);
            updateAll();
        });
    });
}

function toggleFullscreen() {
    const container = document.getElementById('povContainer');
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        container.classList.add('fullscreen');
        document.getElementById('fullscreenIcon').textContent = '✕';
        document.getElementById('fullscreenText').textContent = '退出';
        document.body.style.overflow = 'hidden';
    } else {
        container.classList.remove('fullscreen');
        document.getElementById('fullscreenIcon').textContent = '⛶';
        document.getElementById('fullscreenText').textContent = '全屏';
        document.body.style.overflow = '';
    }
    
    setTimeout(() => updateAll(), 100);
}

function updateAll() {
    const tv = tvSizes[currentSize];
    
    const hAngleRad = 2 * Math.atan((tv.width / 100) / (2 * distance));
    const hAngleDeg = hAngleRad * (180 / Math.PI);
    
    const vAngleRad = 2 * Math.atan((tv.height / 100) / (2 * distance));
    const vAngleDeg = vAngleRad * (180 / Math.PI);

    const heightDiff = (tvHeight - eyeHeight) * 100;
    const wallRatio = (tv.width / 100) / wallWidth * 100;

    drawTopView(hAngleDeg);
    drawSideView(vAngleDeg, heightDiff);
    updatePOVView(hAngleDeg, vAngleDeg, heightDiff, wallRatio);
    updateInfoPanel(hAngleDeg, vAngleDeg, heightDiff, wallRatio);
    updateRecommendation(hAngleDeg, vAngleDeg, heightDiff, wallRatio);
}

function drawTopView(hAngle) {
    const ctx = topCtx;
    const w = topCanvas.width / (window.devicePixelRatio || 1);
    const h = 250;
    
    ctx.clearRect(0, 0, w, h);

    const eyeX = w * 0.15;
    const eyeY = h * 0.5;
    const scale = (w * 0.7) / 5.5;
    const tvX = eyeX + distance * scale;
    const tvWidth = (tvSizes[currentSize].width / 100) * scale;
    const wallWidthPx = wallWidth * scale;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5.5; i += 0.5) {
        const x = eyeX + i * scale;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    ctx.fillStyle = '#444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 1; i <= 5; i++) {
        const x = eyeX + i * scale;
        ctx.fillText(i + 'm', x, h - 5);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(tvX - 5, eyeY - wallWidthPx / 2, 10, wallWidthPx);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tvX - 5, eyeY - wallWidthPx / 2, 10, wallWidthPx);

    const optimalMin = 30 * Math.PI / 180;
    const optimalMax = 40 * Math.PI / 180;
    
    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(eyeX + Math.cos(optimalMin/2) * w, eyeY - Math.sin(optimalMin/2) * w);
    ctx.lineTo(eyeX + Math.cos(optimalMin/2) * w, eyeY + Math.sin(optimalMin/2) * w);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(eyeX + Math.cos(optimalMax/2) * w, eyeY - Math.sin(optimalMax/2) * w);
    ctx.lineTo(eyeX + Math.cos(optimalMax/2) * w, eyeY + Math.sin(optimalMax/2) * w);
    ctx.closePath();
    ctx.fill();

    const angleRad = hAngle * Math.PI / 180;
    ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, eyeY - tvWidth / 2);
    ctx.lineTo(tvX, eyeY + tvWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, eyeY - tvWidth / 2);
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, eyeY + tvWidth / 2);
    ctx.stroke();

    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(tvX - 3, eyeY - tvWidth / 2, 6, tvWidth);

    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👁️', eyeX, eyeY + 4);

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 40, -angleRad/2, angleRad/2);
    ctx.stroke();

    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(hAngle.toFixed(1) + '°', eyeX + 55, eyeY + 4);

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('沙发', eyeX - 15, eyeY + 30);
    ctx.textAlign = 'center';
    ctx.fillText('电视 ' + currentSize + '"', tvX, eyeY - tvWidth/2 - 10);

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.fillText('墙宽 ' + wallWidth.toFixed(1) + 'm', tvX, eyeY + wallWidthPx/2 + 15);

    updateAngleBadge('hAngleBadge', 'hAngleValue', hAngle);
}

function drawSideView(vAngle, heightDiff) {
    const ctx = sideCtx;
    const w = sideCanvas.width / (window.devicePixelRatio || 1);
    const h = 250;
    
    ctx.clearRect(0, 0, w, h);

    const floorY = h * 0.85;
    const scaleH = (h * 0.65) / wallHeight;
    const scaleD = (w * 0.7) / 5.5;
    const eyeX = w * 0.15;
    const tvX = eyeX + distance * scaleD;

    const eyeY = floorY - eyeHeight * scaleH;
    const tvCenterY = floorY - tvHeight * scaleH;
    const tvHeightPx = (tvSizes[currentSize].height / 100) * scaleH;
    const wallHeightPx = wallHeight * scaleH;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, floorY, w, h - floorY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(tvX - 15, floorY - wallHeightPx, 30, wallHeightPx);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(tvX - 15, floorY - wallHeightPx, 30, wallHeightPx);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5.5; i += 0.5) {
        const x = eyeX + i * scaleD;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, floorY);
        ctx.stroke();
    }
    
    for (let i = 0; i <= wallHeight; i += 0.5) {
        const y = floorY - i * scaleH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0.5; i <= wallHeight; i += 0.5) {
        const y = floorY - i * scaleH;
        ctx.fillText(i + 'm', w - 5, y + 3);
    }

    ctx.textAlign = 'center';
    for (let i = 1; i <= 5; i++) {
        const x = eyeX + i * scaleD;
        ctx.fillText(i + 'm', x, floorY + 15);
    }

    ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, tvCenterY - tvHeightPx / 2);
    ctx.lineTo(tvX, tvCenterY + tvHeightPx / 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, tvCenterY - tvHeightPx / 2);
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX, tvCenterY + tvHeightPx / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY);
    ctx.lineTo(tvX + 20, eyeY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(tvX - 4, tvCenterY - tvHeightPx / 2, 8, tvHeightPx);

    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY - 5, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeX, eyeY + 7);
    ctx.lineTo(eyeX, floorY - 10);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.fillRect(eyeX - 25, floorY - 35, 50, 35);

    if (Math.abs(heightDiff) > 5) {
        ctx.strokeStyle = heightDiff > 0 ? '#fbbf24' : '#4ade80';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(tvX + 25, eyeY);
        ctx.lineTo(tvX + 25, tvCenterY);
        ctx.stroke();
        ctx.setLineDash([]);

        const arrowY = (eyeY + tvCenterY) / 2;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText((heightDiff > 0 ? '↑' : '↓') + Math.abs(heightDiff).toFixed(0) + 'cm', tvX + 30, arrowY);
    }

    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('眼睛 ' + eyeHeight.toFixed(2) + 'm', eyeX, eyeY - 30);
    ctx.fillText('电视 ' + tvHeight.toFixed(2) + 'm', tvX, tvCenterY - tvHeightPx/2 - 10);

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.fillText('墙高 ' + wallHeight.toFixed(1) + 'm', tvX, floorY - wallHeightPx - 8);

    updateAngleBadge('vAngleBadge', 'vAngleValue', vAngle);
}

function updateAngleBadge(badgeId, valueId, angle) {
    const badge = document.getElementById(badgeId);
    const value = document.getElementById(valueId);
    
    value.textContent = angle.toFixed(1) + '°';
    
    badge.classList.remove('good', 'warning', 'bad');
    if (badgeId === 'hAngleBadge') {
        if (angle >= 28 && angle <= 40) {
            badge.classList.add('good');
        } else if (angle >= 20 && angle <= 50) {
            badge.classList.add('warning');
        } else {
            badge.classList.add('bad');
        }
    }
}

function updatePOVView(hAngle, vAngle, heightDiff, wallRatio) {
    const povView = document.getElementById('povView');
    const povTv = document.getElementById('povTv');
    const povWall = document.getElementById('povWall');
    const povLabel = document.getElementById('povLabel');
    const humanRef = document.getElementById('humanRef');

    const viewWidth = povView.offsetWidth;
    const viewHeight = povView.offsetHeight;

    // 计算墙面的真实宽高比
    const wallAspectRatio = wallWidth / wallHeight;

    // 假设水平视野为70度
    const hFOV = 70;
    
    // 墙面水平视角
    const wallHAngle = 2 * Math.atan((wallWidth / 2) / distance) * (180 / Math.PI);
    
    // 墙面在视野中的水平占比
    const wallWidthPercent = Math.min((wallHAngle / hFOV) * 100, 90);
    
    // 墙面的像素宽度
    const wallW = viewWidth * wallWidthPercent / 100;
    
    // 墙面的像素高度（保持真实宽高比）
    const wallH = Math.min(wallW / wallAspectRatio, viewHeight * 0.8);
    
    // 根据实际高度重新计算宽度以保持比例
    const actualWallW = wallH * wallAspectRatio;

    // 墙面位置（居中）
    const wallLeft = (viewWidth - actualWallW) / 2;
    const wallTop = (viewHeight - wallH) / 2 - viewHeight * 0.05;

    povWall.style.width = actualWallW + 'px';
    povWall.style.height = wallH + 'px';
    povWall.style.left = wallLeft + 'px';
    povWall.style.top = wallTop + 'px';

    // 更新墙面尺寸标签
    document.getElementById('povWallWidthLabel').textContent = wallWidth.toFixed(1) + 'm';
    document.getElementById('povWallHeightLabel').textContent = wallHeight.toFixed(1) + 'm';

    // 电视尺寸 - 保持16:9比例
    const tv = tvSizes[currentSize];
    const tvAspectRatio = tv.width / tv.height; // 约1.78 (16:9)
    
    // 电视宽度占墙面宽度的比例
    const tvWidthRatio = (tv.width / 100) / wallWidth;
    const tvW = actualWallW * tvWidthRatio;
    
    // 电视高度按照真实16:9比例计算
    const tvH = tvW / tvAspectRatio;

    povTv.style.width = tvW + 'px';
    povTv.style.height = tvH + 'px';

    // 电视水平居中于墙面
    const tvLeft = wallLeft + (actualWallW - tvW) / 2;
    povTv.style.left = tvLeft + 'px';

    // 电视垂直位置
    const tvCenterFromFloor = tvHeight;
    const tvCenterRatioFromBottom = tvCenterFromFloor / wallHeight;
    const tvCenterYInWall = wallH * (1 - tvCenterRatioFromBottom);
    const tvTop = wallTop + tvCenterYInWall - tvH / 2;

    // 根据眼睛高度调整视野偏移
    const eyeCenterRatio = eyeHeight / wallHeight;
    const viewOffset = (eyeCenterRatio - 0.5) * wallH * 0.2;

    povTv.style.top = Math.max(wallTop, Math.min(tvTop - viewOffset, wallTop + wallH - tvH)) + 'px';

    // 更新标签
    povLabel.textContent = `${currentSize}" | ${Math.round(tv.width)}×${Math.round(tv.height)}cm`;

    // 更新右上角统计信息
    document.getElementById('povWallSize').textContent = `${wallWidth.toFixed(1)}×${wallHeight.toFixed(1)}m`;
    document.getElementById('povTvRatio').textContent = wallRatio.toFixed(0) + '%';

    // 核心功能：人像参照计算
    // 逻辑：1.7m 在当前墙高(wallHeight)和墙像素高(wallH)下的像素值
    const humanHeightMeters = 1.7;
    const humanHeightPx = (humanHeightMeters / wallHeight) * wallH;
    const humanWidthPx = humanHeightPx * 0.4; // 假设宽高比 0.4

    humanRef.style.height = humanHeightPx + 'px';
    humanRef.style.width = humanWidthPx + 'px';
}

function updateInfoPanel(hAngle, vAngle, heightDiff, wallRatio) {
    const tv = tvSizes[currentSize];

    document.getElementById('infoSize').textContent = currentSize + '英寸';
    document.getElementById('infoDimensions').textContent = 
        `${Math.round(tv.width)}×${Math.round(tv.height)}cm`;
    document.getElementById('infoDistance').textContent = distance.toFixed(1) + '米';

    const hAngleEl = document.getElementById('infoHAngle');
    hAngleEl.textContent = hAngle.toFixed(1) + '°';
    hAngleEl.className = 'value';
    if (hAngle >= 28 && hAngle <= 40) {
        hAngleEl.classList.add('good');
    } else if (hAngle >= 20 && hAngle <= 50) {
        hAngleEl.classList.add('warning');
    } else {
        hAngleEl.classList.add('bad');
    }

    document.getElementById('infoVAngle').textContent = vAngle.toFixed(1) + '°';

    const heightEl = document.getElementById('infoHeightDiff');
    const absHeightDiff = Math.abs(heightDiff);
    heightEl.textContent = (heightDiff >= 0 ? '+' : '') + heightDiff.toFixed(0) + 'cm';
    heightEl.className = 'value';
    if (absHeightDiff <= 10) {
        heightEl.classList.add('good');
    } else if (absHeightDiff <= 25) {
        heightEl.classList.add('warning');
    } else {
        heightEl.classList.add('bad');
    }

    const ratioEl = document.getElementById('infoWallRatio');
    ratioEl.textContent = wallRatio.toFixed(0) + '%';
    ratioEl.className = 'value';
    if (wallRatio >= 40 && wallRatio <= 60) {
        ratioEl.classList.add('good');
    } else if (wallRatio >= 30 && wallRatio <= 70) {
        ratioEl.classList.add('warning');
    } else {
        ratioEl.classList.add('bad');
    }
}

function updateRecommendation(hAngle, vAngle, heightDiff, wallRatio) {
    const targetAngle = 32 * Math.PI / 180;
    const recommendedWidth = 2 * distance * Math.tan(targetAngle / 2) * 100;

    let recommendedSize = 75;
    let minDiff = Infinity;

    Object.entries(tvSizes).forEach(([size, dims]) => {
        const diff = Math.abs(dims.width - recommendedWidth);
        if (diff < minDiff) {
            minDiff = diff;
            recommendedSize = parseInt(size);
        }
    });

    let text = `根据您 <strong>${distance.toFixed(1)}米</strong> 的观看距离，`;

    const sizes = Object.keys(tvSizes).map(Number).sort((a, b) => a - b);
    const recIndex = sizes.indexOf(recommendedSize);
    const minRec = sizes[Math.max(0, recIndex)];
    const maxRec = sizes[Math.min(sizes.length - 1, recIndex + 1)];

    text += `推荐选择 <span class="rec-size">${minRec}-${maxRec}英寸</span> 的电视。`;

    if (hAngle >= 30 && hAngle <= 40) {
        text += ` 当前选择的 <strong>${currentSize}英寸</strong> 非常合适！`;
        text += ` ${hAngle.toFixed(1)}° 的水平视场角达到了THX推荐的电影院级别体验。`;
    } else if (hAngle >= 25 && hAngle < 30) {
        text += ` 当前 <strong>${currentSize}英寸</strong> 略小，可考虑更大一档以获得更沉浸的体验。`;
    } else if (hAngle > 40 && hAngle <= 50) {
        text += ` 当前 <strong>${currentSize}英寸</strong> 稍大，坐近时可能需要转动头部，但沉浸感会更强。`;
    } else if (hAngle < 25) {
        text += ` 当前 <strong>${currentSize}英寸</strong> 偏小，建议选择更大尺寸以提升观影体验。`;
    } else {
        text += ` 当前 <strong>${currentSize}英寸</strong> 过大，可能造成观看疲劳。`;
    }

    if (wallRatio > 70) {
        text += ` ⚠️ 电视占墙面宽度 ${wallRatio.toFixed(0)}%，视觉上可能显得过于拥挤，建议考虑小一号的电视或更宽的电视墙。`;
    } else if (wallRatio < 35) {
        text += ` 电视占墙面 ${wallRatio.toFixed(0)}%，墙面空间充裕，可以考虑更大尺寸的电视。`;
    } else if (wallRatio >= 40 && wallRatio <= 55) {
        text += ` ✅ 电视占墙面 ${wallRatio.toFixed(0)}%，比例协调美观。`;
    }

    const absHeightDiff = Math.abs(heightDiff);
    if (absHeightDiff > 20) {
        if (heightDiff > 0) {
            text += ` ⚠️ 电视中心高于眼睛 ${absHeightDiff.toFixed(0)}cm，长时间观看可能造成颈部疲劳，建议降低电视安装高度。`;
        } else {
            text += ` ⚠️ 电视中心低于眼睛 ${absHeightDiff.toFixed(0)}cm，建议适当提高电视安装位置。`;
        }
    } else if (absHeightDiff <= 10) {
        text += ` ✅ 电视高度与眼睛平齐，观看姿势舒适。`;
    }

    document.getElementById('recText').innerHTML = text;
}

function loadVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    if (!url) {
        alert('请输入视频URL');
        return;
    }
    playVideo(url);
}

function playVideo(url) {
    const screen = document.getElementById('povScreen');

    if (currentVideo) {
        currentVideo.pause();
        if (currentVideo.src.startsWith('blob:')) {
            URL.revokeObjectURL(currentVideo.src);
        }
    }

    screen.innerHTML = `
        <video id="povVideo" autoplay loop muted playsinline>
            <source src="${url}" type="video/mp4">
        </video>
    `;

    currentVideo = document.getElementById('povVideo');
    
    // 点击切换静音/播放
    currentVideo.addEventListener('click', () => {
        if (currentVideo.muted) {
            currentVideo.muted = false;
        }
        if (currentVideo.paused) {
            currentVideo.play();
        } else {
            currentVideo.pause();
        }
    });

    currentVideo.addEventListener('error', () => {
        screen.innerHTML = '<span>⚠️ 视频加载失败</span>';
    });
}