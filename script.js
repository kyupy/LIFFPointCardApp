// --- 設定項目 ---
const LIFF_ID = "2008166327-NVge42LW"; 
// 2つのGASのURLを設定
const GAS_URL_REGISTER = "https://script.google.com/macros/s/AKfycbxN47CVAu6CXVCwgtvWlTKavmfFxgeWxBwKCkIq7I2bHv8jHt3uZwTNsjVgNyZoOrJd/exec"; 
const GAS_URL_ADD_POINT = "https://script.google.com/macros/s/AKfycbxWtpYlUi7giPbO_8NjGkKAcf1HGLauGJPp8PQOZaTyNJ6Idg7RsuHFeAAOvSEPAEhD/exec"; 
// --- 設定はここまで --

document.addEventListener('DOMContentLoaded', () => {
    main();
});

async function main() {
    document.getElementById('loading-view').style.display = 'block';

    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');
        const action = urlParams.get('action');

        if (!eventId || !action) {
            document.body.innerHTML = "エラー: 不正なアクセスです。QRコードを読み取り直してください。";
            return;
        }

        // actionに応じて処理を振り分け
        if (action === 'register') {
            setupRegistrationForm(eventId);
        } else if (action === 'addPoint') {
            await processPointAddition(eventId);
        } else {
            alert('不明なアクションです。');
        }

    } catch (error) {
        console.error(error);
        alert('アプリの初期化に失敗しました。');
        document.body.innerHTML = "エラー: アプリの初期化に失敗しました。";
    } finally {
        document.getElementById('loading-view').style.display = 'none';
    }
}

// --- イベント申込フォームの準備 ---
function setupRegistrationForm(eventId) {
    document.getElementById('form-view').style.display = 'block';

    const form = document.getElementById('application-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const profile = await liff.getProfile();
        const formData = new FormData(form);
        const formProps = Object.fromEntries(formData);
        
        const submissionData = {
            action: 'register',
            userId: profile.userId,
            displayName: profile.displayName,
            eventId: eventId,
            ...formProps
        };

        sendRequest(GAS_URL_REGISTER, submissionData);
        document.getElementById('form-view').style.display = 'none';
        document.getElementById('complete-view').style.display = 'block';
    });
}

// --- ポイント加算処理 ---
async function processPointAddition(eventId) {
    document.getElementById('add-point-view').style.display = 'block';

    const profile = await liff.getProfile();
    const pointData = {
        action: 'addPoint',
        userId: profile.userId,
        eventId: eventId
    };

    sendRequest(GAS_URL_ADD_POINT, pointData);
}

// --- 共通のデータ送信関数 ---
function sendRequest(url, data) {
    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
    }).catch(error => {
        console.error("Fetch error:", error);
        alert('データの送信に失敗しました。ネットワーク環境の良い場所で再度お試しください。');
    });
}