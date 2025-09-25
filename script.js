// --- 設定項目 ---
// ポイント加算専用GASのURLを設定する
const LIFF_ID = "2008166327-NVge42LW"; 
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWtpYlUi7giPbO_8NjGkKAcf1HGLauGJPp8PQOZaTyNJ6Idg7RsuHFeAAOvSEPAEhD/exec"; 
// --- 設定はここまで --

document.addEventListener('DOMContentLoaded', () => {
    main();
});

async function main() {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');

        if (!eventId) {
            updateDisplay('無効なアクセスです', 'イベントIDが見つかりません。');
            return;
        }

        const profile = await liff.getProfile();
        addPoint(profile.userId, eventId);

    } catch (error) {
        console.error(error);
        updateDisplay('エラーが発生しました', 'LIFFの初期化に失敗しました。');
    }
}

async function addPoint(userId, eventId) {
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'addPoint',
                userId: userId,
                eventId: eventId
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            updateDisplay('Success!', result.message);
        } else if (result.status === 'info') {
            updateDisplay('Info', result.message);
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error(error);
        updateDisplay('Error', 'ポイントの加算に失敗しました。');
    }
}

function updateDisplay(status, result) {
    document.getElementById('status-message').textContent = status;
    document.getElementById('result-message').textContent = result;
}