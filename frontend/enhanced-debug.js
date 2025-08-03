// 拡張デバッグスクリプト - ブラウザコンソールで実行
console.log("=== 未病診断フロー詳細デバッグ開始 ===");

// 状態監視オブジェクト
const DiagnosisDebugger = {
    state: {
        questionsFound: 0,
        currentState: 'unknown',
        errors: [],
        logs: []
    },
    
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        this.state.logs.push(logEntry);
    },
    
    error(message) {
        const timestamp = new Date().toLocaleTimeString();
        const errorEntry = `[${timestamp}] ERROR: ${message}`;
        console.error(errorEntry);
        this.state.errors.push(errorEntry);
    },
    
    checkComponent() {
        const chatComponent = document.querySelector('[data-testid="chat-diagnosis"]');
        if (chatComponent) {
            this.log("✅ ChatDiagnosisコンポーネントが見つかりました");
            return true;
        } else {
            this.error("❌ ChatDiagnosisコンポーネントが見つかりません");
            return false;
        }
    },
    
    checkQuestions() {
        const questionElements = document.querySelectorAll('[data-question-id]');
        this.state.questionsFound = questionElements.length;
        this.log(`質問要素数: ${questionElements.length}`);
        
        if (questionElements.length > 0) {
            questionElements.forEach((el, index) => {
                const questionId = el.getAttribute('data-question-id');
                this.log(`  質問 ${index + 1}: ID=${questionId}`);
            });
        }
        
        return questionElements.length;
    },
    
    checkMessages() {
        const messages = document.querySelectorAll('.max-w-md');
        this.log(`メッセージ数: ${messages.length}`);
        
        messages.forEach((msg, index) => {
            const content = msg.textContent?.substring(0, 50) + '...';
            this.log(`  メッセージ ${index + 1}: ${content}`);
        });
        
        return messages.length;
    },
    
    checkButtons() {
        const buttons = document.querySelectorAll('button');
        this.log(`ボタン数: ${buttons.length}`);
        
        buttons.forEach((btn, index) => {
            const text = btn.textContent?.trim();
            const disabled = btn.disabled;
            this.log(`  ボタン ${index + 1}: "${text}" (無効化: ${disabled})`);
        });
        
        return buttons.length;
    },
    
    checkErrors() {
        // React開発モードのエラーをチェック
        const reactErrors = document.querySelectorAll('[data-reactroot] .error, .error-overlay');
        if (reactErrors.length > 0) {
            this.error(`React エラーが検出されました: ${reactErrors.length}個`);
            reactErrors.forEach((err, index) => {
                this.error(`  エラー ${index + 1}: ${err.textContent}`);
            });
        }
        
        return reactErrors.length;
    },
    
    monitorConsole() {
        // コンソールエラーの監視
        const originalError = console.error;
        console.error = (...args) => {
            this.error(`Console Error: ${args.join(' ')}`);
            originalError.apply(console, args);
        };
        
        this.log("コンソールエラー監視を開始しました");
    },
    
    runFullDiagnostic() {
        this.log("=== フル診断開始 ===");
        
        const componentFound = this.checkComponent();
        const questionsCount = this.checkQuestions();
        const messagesCount = this.checkMessages();
        const buttonsCount = this.checkButtons();
        const errorsCount = this.checkErrors();
        
        this.log("=== 診断結果サマリー ===");
        this.log(`コンポーネント検出: ${componentFound ? '✅' : '❌'}`);
        this.log(`質問要素: ${questionsCount}個`);
        this.log(`メッセージ: ${messagesCount}個`);
        this.log(`ボタン: ${buttonsCount}個`);
        this.log(`エラー: ${errorsCount}個`);
        
        if (this.state.errors.length > 0) {
            this.log("=== 検出されたエラー ===");
            this.state.errors.forEach(error => console.log(error));
        }
        
        return {
            componentFound,
            questionsCount,
            messagesCount,
            buttonsCount,
            errorsCount,
            errors: this.state.errors,
            logs: this.state.logs
        };
    },
    
    watchStateChanges() {
        let lastState = '';
        const watcher = setInterval(() => {
            const component = document.querySelector('[data-testid="chat-diagnosis"]');
            if (component) {
                const currentQuestionId = document.querySelector('[data-question-id]')?.getAttribute('data-question-id');
                const currentState = `Question: ${currentQuestionId || 'none'}`;
                
                if (currentState !== lastState) {
                    this.log(`状態変化: ${lastState} → ${currentState}`);
                    lastState = currentState;
                }
            }
        }, 500);
        
        this.log("状態変化監視を開始しました (停止するには clearInterval(watcher) を実行)");
        return watcher;
    }
};

// 初期化
DiagnosisDebugger.monitorConsole();

// コンポーネント検出まで待機
let initWatcher = setInterval(() => {
    if (DiagnosisDebugger.checkComponent()) {
        clearInterval(initWatcher);
        
        // 3秒後にフル診断実行
        setTimeout(() => {
            const result = DiagnosisDebugger.runFullDiagnostic();
            
            // グローバルに結果を保存
            window.diagnosisDebugResult = result;
            window.diagnosisDebugger = DiagnosisDebugger;
            
            console.log("=== デバッグ完了 ===");
            console.log("結果はwindow.diagnosisDebugResultで確認できます");
            console.log("継続監視はwindow.diagnosisDebugger.watchStateChanges()で開始できます");
            
        }, 3000);
    }
}, 1000);

// 10秒でタイムアウト
setTimeout(() => {
    if (initWatcher) {
        clearInterval(initWatcher);
        DiagnosisDebugger.error("コンポーネント検出がタイムアウトしました");
    }
}, 10000);