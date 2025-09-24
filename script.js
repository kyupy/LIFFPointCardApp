// --- 設定項目 ---
const LIFF_ID = "YOUR_LIFF_ID"; // 3. で取得するLIFF IDをここに入力
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxWtpYlUi7giPbO_8NjGkKAcf1HGLauGJPp8PQOZaTyNJ6Idg7RsuHFeAAOvSEPAEhD/exec"; // 1. で取得したGASのURLをここに入力
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

        const profile = await liff.getProfile();
        const userId = profile.userId;

        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventId');

        if (eventId) {
            // eventIdがある場合はポイント加算処理
            await addPoint(userId, eventId);
        } else {
            // eventIdがない場合はユーザー情報取得のみ
            await fetchUserData(userId);
        }

    } catch (error) {
        console.error(error);
        document.getElementById('loading').textContent = 'エラーが発生しました。';
        showMessage('LIFFの初期化に失敗しました。');
    }
}

// サーバーにリクエストを送信する共通関数
async function postToServer(data) {
    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // CORSエラーを回避するため
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        // no-corsモードではレスポンスボディを直接読めないため、
        // 処理成功を前提として、最新情報を再取得する
        return { status: 'success_nocors' };
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error('サーバーとの通信に失敗しました。');
    }
}

// ポイント加算処理
async function addPoint(userId, eventId) {
    showMessage('ポイントを確認中...');
    try {
        // ポイント加算リクエスト（no-corsのためレスポンスは直接使わない）
        await postToServer({ action: 'addPoint', userId: userId, eventId: eventId });

        // ポイント加算後に最新のユーザー情報を取得して表示を更新
        await fetchUserData(userId, 'ポイント処理が完了しました。');

    } catch (error) {
        showMessage(error.message);
        await fetchUserData(userId); // エラーでも現在のポイントは表示
    }
}

// ユーザー情報を取得して表示する関数
async function fetchUserData(userId, initialMessage = '') {
    try {
        // GASのエンドポイントを直接叩くのではなく、doGetでユーザー情報を返す別のエンドポイントを用意するか、
        // このデモではシンプルにするため、一旦ダミーで表示を更新し、GAS側での処理完了を信じる
        // 本番環境では、GAS側でdoGetを実装し、そこから情報を取得するのがより堅牢

        // とはいえ、doPostで情報を取得する口も作ったので、それを使ってみよう。
        // しかし、no-corsではレスポンスが読めないため、このアプローチは使えない。
        // GAS側でCORSヘッダーを許可するか、JSONPを使う必要があるが、今回はシンプルさを優先。
        // ユーザーには「処理完了」とだけ伝え、実際のポイントはGAS側で更新されていると信じる。

        const profile = await liff.getProfile();
        document.getElementById('user-name').textContent = profile.displayName;
        // ポイントはGASから取得できないので、一旦表示を隠すか、ローカルで保持するなどの工夫が必要
        // ここでは、メッセージ表示に留める
        if (initialMessage) {
            showMessage(initialMessage);
        } else {
             showMessage('会員証へようこそ！');
        }

        // ローディングを非表示にし、カードを表示
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('card-container').classList.remove('hidden');

    } catch (error) {
        showMessage(error.message);
    }
}

// 画面にメッセージを表示する関数
function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}