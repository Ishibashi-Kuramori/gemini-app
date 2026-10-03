// 画面要素の取得
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const loading = document.getElementById('loading');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const optionBtns = document.querySelectorAll('.option-btn');

const currentPhaseEl = document.getElementById('current-phase');
const storyBox = document.getElementById('story-box');
const fullStoryBox = document.getElementById('full-story-box');

// 追加: プルダウン要素とジャンル変数
const genreSelect = document.getElementById('genre-select');
let selectedGenre = 'ファンタジー';

// ゲーム状態の管理
const PHASES = ['起', '承', '転', '結'];
let currentPhaseIndex = 0;
let storyHistory = []; // { phase, story, selectedOption }

// 画面切り替え関数
function showScreen(screen) {
    [titleScreen, gameScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ローディング制御
function setLoading(isLoading, text = '物語を考えています...') {
    document.getElementById('loading-text').textContent = text;
    loading.style.display = isLoading ? 'flex' : 'none';
}

// ゲーム開始イベント
startBtn.addEventListener('click', () => {
    currentPhaseIndex = 0;
    storyHistory = [];
    selectedGenre = genreSelect.value; // 選択されたジャンルを取得
    fetchStoryStep(null);
});

// 選択肢のクリックイベント
optionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedOption = e.target.textContent;
        // 直前の物語にユーザーが選んだ選択肢を記録
        storyHistory[storyHistory.length - 1].selectedOption = selectedOption;
        
        currentPhaseIndex++;
        fetchStoryStep(selectedOption);
    });
});

// バックエンド通信処理
async function fetchStoryStep(selectedOption) {
    const phase = PHASES[currentPhaseIndex];
    setLoading(true, `「${phase}」の展開を生成中...`);

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phase: phase,
                genre: selectedGenre, // 追加: ジャンル情報を送信
                history: storyHistory,
                selectedOption: selectedOption
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'エラーが発生しました。');
        }

        // 生成された物語を履歴に追加
        storyHistory.push({
            phase: phase,
            story: data.story
        });

        // フェーズに応じた画面処理
        if (phase === '結') {
            renderResultScreen();
        } else {
            renderGameScreen(phase, data.story, data.options);
        }

    } catch (error) {
        alert(`エラー: ${error.message}`);
        console.error(error);
    } finally {
        setLoading(false);
    }
}

// 選択画面のレンダリング (起・承・転)
function renderGameScreen(phase, story, options) {
    currentPhaseEl.textContent = phase;
    storyBox.textContent = story;

    // 選択肢ボタンのテキスト設定
    options.forEach((opt, index) => {
        if (optionBtns[index]) {
            optionBtns[index].textContent = opt;
        }
    });

    showScreen(gameScreen);
}

// 結果画面のレンダリング (起承転結のまとめ)
function renderResultScreen() {
    fullStoryBox.innerHTML = '';

    storyHistory.forEach(item => {
        const section = document.createElement('div');
        section.classList.add('story-section');
        section.innerHTML = `
            <h3>【${item.phase}】</h3>
            <p>${item.story}</p>
        `;
        fullStoryBox.appendChild(section);
    });

    showScreen(resultScreen);
}

// タイトルへ戻る
restartBtn.addEventListener('click', () => {
    showScreen(titleScreen);
});
