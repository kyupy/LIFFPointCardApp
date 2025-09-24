// --- 設定項目 ---
const LIFF_ID = "2008166327-NVge42LW"; 
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWtpYlUi7giPbO_8NjGkKAcf1HGLauGJPp8PQOZaTyNJ6Idg7RsuHFeAAOvSEPAEhD/exec"; 
// --- 設定はここまで ---

document.addEventListener('DOMContentLoaded', () => {
    initializeLiff();
});

async function initializeLiff() {
    try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        const userId = (await liff.getProfile()).userId;
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');

        // eventIdがあればポイント加算、なければデータ取得のみ
        if (eventId) {
            await addPoint(userId, eventId);
        } else {
            await fetchUserData(userId, '会員証へようこそ！');
        }

    } catch (error) {
        console.error(error);
        showMessage('LIFFの初期化に失敗しました。');
    } finally {
        // 処理の成否に関わらず、カードを表示する
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('card-container').classList.remove('hidden');
    }
}

// ポイント加算処理（POSTリクエスト）
async function addPoint(userId, eventId) {
    showMessage('ポイントを加算中...');
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            // GASはtext/plainで受け取るのが安定する
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'addPoint', userId: userId, eventId: eventId })
        });

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message);
        }

        showMessage(result.message || '処理が完了しました。');

    } catch (error) {
        console.error('Add point error:', error);
        showMessage(error.message || 'ポイント加算に失敗しました。');
    } finally {
        // ポイント加算処理の成否に関わらず、最後に必ず最新のポイント情報を取得・表示
        await fetchUserData(userId);
    }
}

// ユーザー情報を取得して表示する関数（GETリクエスト）
async function fetchUserData(userId, initialMessage = null) {
    if (initialMessage) {
        showMessage(initialMessage);
    }
    try {
        // URLにuserIdを付けてGETリクエストを送信
        const response = await fetch(`${GAS_WEB_APP_URL}?userId=${userId}`);
        const data = await response.json();

        if (data.status === 'success') {
            document.getElementById('user-name').textContent = data.name;
            document.getElementById('points').textContent = `${data.points} P`;
        } else {
            // スプレッドシートにユーザーが見つからない場合、LINEの名前を表示
            const profile = await liff.getProfile();
            document.getElementById('user-name').textContent = profile.displayName;
            document.getElementById('points').textContent = '0 P'; // ポイントは0と表示
            showMessage(data.message);
        }

    } catch (error) {
        console.error('Fetch user data error:', error);
        showMessage('ユーザー情報の取得に失敗しました。');
        // ネットワークエラー等の場合でも、LINEプロフィール名を表示
        try {
            const profile = await liff.getProfile();
            document.getElementById('user-name').textContent = profile.displayName;
        } catch (profileError) {
            document.getElementById('user-name').textContent = '...';
        }
        document.getElementById('points').textContent = '-- P';
    }
}

// 画面にメッセージを表示する関数
function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}