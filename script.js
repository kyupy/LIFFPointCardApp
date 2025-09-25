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

// addPoint関数を「投げっぱなし」方式に変更
function addPoint(userId, eventId) {
    // 画面表示をすぐに更新
    updateDisplay('Request Sent', 'ポイント加算リクエストを送信しました。');

    // fetchを no-cors モードで実行し、応答を待たない
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: 'addPoint',
            userId: userId,
            eventId: eventId
        })
    }).catch(error => {
        // ネットワークエラーなど、送信自体に失敗した場合
        console.error("Fetch error:", error);
        updateDisplay('Error', 'リクエストの送信に失敗しました。');
    });
}

function updateDisplay(status, result) {
    document.getElementById('status-message').textContent = status;
    document.getElementById('result-message').textContent = result;
}