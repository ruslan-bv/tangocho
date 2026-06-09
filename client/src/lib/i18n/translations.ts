export type Locale = 'en' | 'ja' | 'ru';

export interface Translations {
  nav: {
    home: string;
    decks: string;
    study: string;
    add: string;
    import: string;
  };
  a11y: {
    skipToContent: string;
    changeLanguage: string;
    openMenu: string;
    closeMenu: string;
    primaryNav: string;
  };
  common: {
    loading: string;
    cancel: string;
    create: string;
    creating: string;
    delete: string;
    close: string;
    cards: string;
    new: string;
    review: string;
    addWord: string;
    createNew: string;
    loadFailed: string;
    back: string;
    retry: string;
  };
  toast: {
    wordAdded: string;
    deckCreated: string;
    deckDeleted: string;
    cardDeleted: string;
    reviewFailed: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    dueCards: string;
    dueCardsLabel: string;
    startStudy: string;
    addNewWord: string;
    decks: string;
    noDecks: string;
    createFirst: string;
  };
  study: {
    loadingCards: string;
    complete: string;
    reviewedToday: string;
    goHome: string;
    remaining: string;
    showAnswer: string;
    again: string;
    hard: string;
    good: string;
    easy: string;
    noCardsTitle: string;
    noCardsDesc: string;
    allReviewedTitle: string;
    allReviewedDesc: string;
    selectDeck: string;
    selectDeckDesc: string;
    endSession: string;
    undo: string;
    cardProgress: string;
    studyAgain: string;
    tapToReveal: string;
  };
  add: {
    title: string;
    searchPlaceholder: string;
    searching: string;
    common: string;
    preview: string;
    targetDeck: string;
    adding: string;
    addToDeck: string;
    createDeckFirst: string;
    createDeck: string;
    noResults: string;
    noResultsFor: string;
    alreadyAdded: string;
    addAnother: string;
    clearSearch: string;
  };
  decks: {
    title: string;
    empty: string;
    emptyDesc: string;
    createTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    nameRequired: string;
    createFailed: string;
    notFound: string;
    backToList: string;
    studyCount: string;
    addWordShort: string;
    totalCards: string;
    newCards: string;
    dueCards: string;
    cardList: string;
    showCards: string;
    hideCards: string;
    noCards: string;
    deleteConfirm: string;
    deleteConfirmWithCount: string;
    deleteFailed: string;
    dueCardAria: string;
  };
  flashcard: {
    meanings: string;
    examples: string;
    kanji: string;
  };
  card: {
    notFound: string;
    backToDeck: string;
    deleteConfirm: string;
    deleteFailed: string;
    dueDate: string;
    interval: string;
    repetitions: string;
    easeFactor: string;
    days: string;
    srs: string;
    strokes: string;
    onReading: string;
    kunReading: string;
  };
  wordPreview: {
    common: string;
    meanings: string;
    otherForms: string;
    examples: string;
    loadingExamples: string;
    noExamples: string;
    examplesError: string;
    play: string;
    stop: string;
  };
  login: {
    tagline: string;
    modeSignIn: string;
    modeRegister: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    submitSignIn: string;
    submitRegister: string;
    submittingSignIn: string;
    submittingRegister: string;
    switchToRegister: string;
    switchToSignIn: string;
    note: string;
    error: string;
    invalidCredentials: string;
    emailExists: string;
    passwordTooShort: string;
    invalidEmail: string;
  };
  auth: {
    signOut: string;
    loading: string;
  };
  theme: {
    toLight: string;
    toNight: string;
  };
  import: {
    title: string;
    description: string;
    textareaLabel: string;
    textareaPlaceholder: string;
    targetDeck: string;
    parse: string;
    parsing: string;
    reparse: string;
    noWordsFound: string;
    parseError: string;
    foundCount: string;
    selectAll: string;
    selectNone: string;
    alreadyInDeck: string;
    create: string;
    creating: string;
    createdCount: string;
    createFailed: string;
    skippedCount: string;
    failedCount: string;
    textTooLong: string;
    needDeck: string;
    statusAdded: string;
    progressLabel: string;
    statusSkipped: string;
    statusFailed: string;
    alreadyInDeckCount: string;
    charCount: string;
  };
}

export const en: Translations = {
  nav: {
    home: 'Home',
    decks: 'Decks',
    study: 'Study',
    add: 'Add',
    import: 'Import',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    changeLanguage: 'Change language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primaryNav: 'Primary',
  },
  common: {
    loading: 'Loading...',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating...',
    delete: 'Delete',
    close: 'Close',
    cards: 'cards',
    new: 'New',
    review: 'Review',
    addWord: 'Add word',
    createNew: '+ Create New',
    loadFailed: 'Failed to load data',
    back: 'Back',
    retry: 'Retry',
  },
  toast: {
    wordAdded: 'Word added successfully',
    deckCreated: 'Deck created successfully',
    deckDeleted: 'Deck deleted successfully',
    cardDeleted: 'Card deleted successfully',
    reviewFailed: 'Failed to submit review',
  },
  home: {
    welcome: 'Welcome',
    subtitle: 'Learn Japanese vocabulary efficiently',
    dueCards: '{count} cards due for review',
    dueCardsLabel: 'cards due for review',
    startStudy: 'Start Studying',
    addNewWord: 'Add New Word',
    decks: 'Decks',
    noDecks: 'No decks yet',
    createFirst: 'Create your first deck',
  },
  study: {
    loadingCards: 'Loading cards...',
    complete: 'Great job!',
    reviewedToday: 'You reviewed {count} cards today',
    goHome: 'Go Home',
    remaining: '{count} remaining',
    showAnswer: 'Show Answer',
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
    noCardsTitle: 'No cards to review',
    noCardsDesc: 'Try adding some new words',
    allReviewedTitle: 'All caught up!',
    allReviewedDesc: 'No cards are due right now. Come back later or add new words.',
    selectDeck: 'Select a Deck',
    selectDeckDesc: 'Choose which deck to study',
    endSession: 'End Session',
    undo: 'Undo',
    cardProgress: '{current} / {total}',
    studyAgain: 'Study again',
    tapToReveal: 'Tap or press Space to reveal',
  },
  add: {
    title: 'Add New Word',
    searchPlaceholder: 'Search in Japanese or English...',
    searching: 'Searching...',
    common: 'Common',
    preview: 'Preview',
    targetDeck: 'Add to deck:',
    adding: 'Adding...',
    addToDeck: 'Add to Deck',
    createDeckFirst: 'Create a deck first',
    createDeck: 'Create Deck',
    noResults: 'No words found',
    noResultsFor: 'No words found for "{query}"',
    alreadyAdded: 'Already in this deck',
    addAnother: 'Add another',
    clearSearch: 'Clear search',
  },
  decks: {
    title: 'Decks',
    empty: 'No decks yet',
    emptyDesc: 'Create a deck and start adding words',
    createTitle: 'Create New Deck',
    nameLabel: 'Deck Name',
    namePlaceholder: 'e.g., JLPT N3 Vocabulary',
    descLabel: 'Description',
    descPlaceholder: 'Deck description (optional)',
    nameRequired: 'Please enter a deck name',
    createFailed: 'Failed to create deck',
    notFound: 'Deck not found',
    backToList: 'Back to Decks',
    studyCount: 'Study ({count})',
    addWordShort: '+ Add Word',
    totalCards: 'Total Cards',
    newCards: 'New',
    dueCards: 'Due',
    cardList: 'Cards',
    showCards: 'Show Cards',
    hideCards: 'Hide Cards',
    noCards: 'No cards yet',
    deleteConfirm: 'Delete "{name}"? This cannot be undone.',
    deleteConfirmWithCount: 'Delete "{name}" and its {count} cards? This cannot be undone.',
    deleteFailed: 'Failed to delete',
    dueCardAria: '{count} cards due for review',
  },
  flashcard: {
    meanings: 'Meanings',
    examples: 'Examples',
    kanji: 'Kanji',
  },
  card: {
    notFound: 'Card not found',
    backToDeck: 'Back to Deck',
    deleteConfirm: 'Delete this card? This cannot be undone.',
    deleteFailed: 'Failed to delete card',
    dueDate: 'Due Date',
    interval: 'Interval',
    repetitions: 'Repetitions',
    easeFactor: 'Ease Factor',
    days: 'days',
    srs: 'Spaced Repetition',
    strokes: '{count} strokes',
    onReading: 'On',
    kunReading: 'Kun',
  },
  wordPreview: {
    common: 'Common',
    meanings: 'Meanings',
    otherForms: 'Other Forms',
    examples: 'Example Sentences',
    loadingExamples: 'Loading examples...',
    noExamples: 'No example sentences found',
    examplesError: "Couldn't load examples",
    play: 'Play audio',
    stop: 'Stop audio',
  },
  login: {
    tagline: 'Learn Japanese vocabulary with spaced repetition',
    modeSignIn: 'Sign in',
    modeRegister: 'Create account',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    nameLabel: 'Display name',
    namePlaceholder: 'Optional',
    submitSignIn: 'Sign in',
    submitRegister: 'Create account',
    submittingSignIn: 'Signing in...',
    submittingRegister: 'Creating account...',
    switchToRegister: "Don't have an account? Create one",
    switchToSignIn: 'Already have an account? Sign in',
    note: 'Your decks stay private to your account.',
    error: 'Something went wrong. Please try again.',
    invalidCredentials: 'Invalid email or password.',
    emailExists: 'An account with this email already exists.',
    passwordTooShort: 'Password must be at least 8 characters.',
    invalidEmail: 'Please enter a valid email address.',
  },
  auth: {
    signOut: 'Sign out',
    loading: 'Loading account...',
  },
  theme: {
    toLight: 'Switch to light theme',
    toNight: 'Switch to night theme',
  },
  import: {
    title: 'Import from Text',
    description: 'Paste Japanese text. We will extract content words (nouns, verbs, adjectives) and turn each one into a flash card.',
    textareaLabel: 'Japanese text',
    textareaPlaceholder: 'Paste a sentence, paragraph, or longer passage in Japanese...',
    targetDeck: 'Add to deck:',
    parse: 'Extract Words',
    parsing: 'Extracting...',
    reparse: 'Re-extract',
    noWordsFound: 'No content words found in this text.',
    parseError: 'Failed to extract words. Please try again.',
    foundCount: 'Found {count} words',
    selectAll: 'Select all',
    selectNone: 'Select none',
    alreadyInDeck: 'Already in deck',
    create: 'Create {count} cards',
    creating: 'Creating cards...',
    createdCount: 'Created {count} cards',
    createFailed: 'Failed to create cards',
    skippedCount: '{count} skipped',
    failedCount: '{count} failed',
    textTooLong: 'Text is too long (max 5000 characters)',
    needDeck: 'Choose a deck first',
    statusAdded: 'Added',
    progressLabel: 'Import progress',
    statusSkipped: 'Already in deck',
    statusFailed: 'Not found',
    alreadyInDeckCount: '{count} already in deck',
    charCount: '{count} / {max}',
  },
};

export const ja: Translations = {
  nav: {
    home: 'ホーム',
    decks: 'デッキ',
    study: '学習',
    add: '追加',
    import: '取り込み',
  },
  a11y: {
    skipToContent: '本文へスキップ',
    changeLanguage: '言語を変更',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    primaryNav: 'メインナビゲーション',
  },
  common: {
    loading: '読み込み中...',
    cancel: 'キャンセル',
    create: '作成',
    creating: '作成中...',
    delete: '削除',
    close: '閉じる',
    cards: 'カード',
    new: '新規',
    review: '復習',
    addWord: '単語を追加',
    createNew: '+ 新規作成',
    loadFailed: 'データの読み込みに失敗しました',
    back: '戻る',
    retry: '再試行',
  },
  toast: {
    wordAdded: '単語を追加しました',
    deckCreated: 'デッキを作成しました',
    deckDeleted: 'デッキを削除しました',
    cardDeleted: 'カードを削除しました',
    reviewFailed: 'レビューの送信に失敗しました',
  },
  home: {
    welcome: 'ようこそ',
    subtitle: '日本語の語彙を効率的に学びましょう',
    dueCards: '{count}枚のカードが復習待ちです',
    dueCardsLabel: '枚のカードが復習待ちです',
    startStudy: '学習を始める',
    addNewWord: '新しい単語を追加',
    decks: 'デッキ',
    noDecks: 'まだデッキがありません',
    createFirst: '最初のデッキを作成',
  },
  study: {
    loadingCards: 'カードを読み込み中...',
    complete: 'お疲れ様でした！',
    reviewedToday: '今日は{count}枚のカードを復習しました',
    goHome: 'ホームに戻る',
    remaining: '残り{count}枚',
    showAnswer: '答えを見る',
    again: 'もう一度',
    hard: '難しい',
    good: '普通',
    easy: '簡単',
    noCardsTitle: '復習するカードがありません',
    noCardsDesc: '新しい単語を追加してみましょう',
    allReviewedTitle: '全部復習しました！',
    allReviewedDesc: '今は復習するカードがありません。後でまた来てください。',
    selectDeck: 'デッキを選択',
    selectDeckDesc: '学習するデッキを選んでください',
    endSession: '終了する',
    undo: '元に戻す',
    cardProgress: '{current} / {total}',
    studyAgain: 'もう一度学習',
    tapToReveal: 'タップまたはスペースキーで表示',
  },
  add: {
    title: '新しい単語を追加',
    searchPlaceholder: '日本語または英語で検索...',
    searching: '検索中...',
    common: '常用',
    preview: 'プレビュー',
    targetDeck: '追加先デッキ:',
    adding: '追加中...',
    addToDeck: 'デッキに追加',
    createDeckFirst: 'まずデッキを作成してください',
    createDeck: 'デッキを作成',
    noResults: '単語が見つかりませんでした',
    noResultsFor: '「{query}」に一致する単語が見つかりませんでした',
    alreadyAdded: 'このデッキに既存',
    addAnother: '続けて追加',
    clearSearch: '検索をクリア',
  },
  decks: {
    title: 'デッキ一覧',
    empty: 'まだデッキがありません',
    emptyDesc: 'デッキを作成して単語を追加しましょう',
    createTitle: '新しいデッキを作成',
    nameLabel: 'デッキ名',
    namePlaceholder: '例: JLPT N3 語彙',
    descLabel: '説明',
    descPlaceholder: 'デッキの説明（任意）',
    nameRequired: 'デッキ名を入力してください',
    createFailed: 'デッキの作成に失敗しました',
    notFound: 'デッキが見つかりません',
    backToList: 'デッキ一覧に戻る',
    studyCount: '学習する ({count})',
    addWordShort: '+ 単語を追加',
    totalCards: '総カード数',
    newCards: '新規',
    dueCards: '復習待ち',
    cardList: 'カード一覧',
    showCards: 'カードを表示',
    hideCards: 'カードを隠す',
    noCards: 'まだカードがありません',
    deleteConfirm: '「{name}」を削除しますか？この操作は取り消せません。',
    deleteConfirmWithCount: '「{name}」とその{count}枚のカードを削除しますか？この操作は取り消せません。',
    deleteFailed: '削除に失敗しました',
    dueCardAria: '復習待ちのカード{count}枚',
  },
  flashcard: {
    meanings: '意味',
    examples: '例文',
    kanji: '漢字',
  },
  card: {
    notFound: 'カードが見つかりません',
    backToDeck: 'デッキに戻る',
    deleteConfirm: 'このカードを削除しますか？この操作は取り消せません。',
    deleteFailed: 'カードの削除に失敗しました',
    dueDate: '復習予定日',
    interval: '間隔',
    repetitions: '復習回数',
    easeFactor: '難易度',
    days: '日',
    srs: '間隔反復',
    strokes: '{count}画',
    onReading: '音読み',
    kunReading: '訓読み',
  },
  wordPreview: {
    common: '常用',
    meanings: '意味',
    otherForms: '他の形',
    examples: '例文',
    loadingExamples: '例文を読み込み中...',
    noExamples: '例文が見つかりませんでした',
    examplesError: '例文を読み込めませんでした',
    play: '音声を再生',
    stop: '音声を停止',
  },
  login: {
    tagline: '間隔反復で日本語の語彙を学びましょう',
    modeSignIn: 'サインイン',
    modeRegister: 'アカウント作成',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: '8文字以上',
    nameLabel: '表示名',
    namePlaceholder: '任意',
    submitSignIn: 'サインイン',
    submitRegister: '作成する',
    submittingSignIn: 'サインイン中...',
    submittingRegister: '作成中...',
    switchToRegister: 'アカウントをお持ちでないですか？作成する',
    switchToSignIn: 'すでにアカウントをお持ちですか？サインイン',
    note: 'デッキはアカウントごとに非公開で保管されます。',
    error: '問題が発生しました。もう一度お試しください。',
    invalidCredentials: 'メールアドレスまたはパスワードが正しくありません。',
    emailExists: 'このメールアドレスのアカウントは既に存在します。',
    passwordTooShort: 'パスワードは8文字以上必要です。',
    invalidEmail: '有効なメールアドレスを入力してください。',
  },
  auth: {
    signOut: 'サインアウト',
    loading: 'アカウントを読み込み中...',
  },
  theme: {
    toLight: '昼テーマに切り替え',
    toNight: '夜テーマに切り替え',
  },
  import: {
    title: 'テキストから取り込み',
    description: '日本語のテキストを貼り付けてください。名詞・動詞・形容詞を抽出してそれぞれフラッシュカードを作成します。',
    textareaLabel: '日本語のテキスト',
    textareaPlaceholder: '日本語の文章や段落を貼り付けてください...',
    targetDeck: '追加先のデッキ：',
    parse: '単語を抽出',
    parsing: '抽出中...',
    reparse: '再抽出',
    noWordsFound: 'このテキストから単語を抽出できませんでした。',
    parseError: '抽出に失敗しました。もう一度お試しください。',
    foundCount: '{count}個の単語が見つかりました',
    selectAll: 'すべて選択',
    selectNone: 'すべて解除',
    alreadyInDeck: 'デッキに既存',
    create: '{count}枚のカードを作成',
    creating: '作成中...',
    createdCount: '{count}枚のカードを作成しました',
    createFailed: 'カードの作成に失敗しました',
    skippedCount: '{count}件スキップ',
    failedCount: '{count}件失敗',
    textTooLong: 'テキストが長すぎます（最大5000文字）',
    needDeck: 'デッキを選択してください',
    statusAdded: '追加済み',
    progressLabel: '取り込みの進行状況',
    statusSkipped: 'デッキに既存',
    statusFailed: '見つかりません',
    alreadyInDeckCount: '{count}件はデッキに既存',
    charCount: '{count} / {max}',
  },
};

export const ru: Translations = {
  nav: {
    home: 'Главная',
    decks: 'Колоды',
    study: 'Учить',
    add: 'Добавить',
    import: 'Импорт',
  },
  a11y: {
    skipToContent: 'Перейти к содержимому',
    changeLanguage: 'Сменить язык',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    primaryNav: 'Основная навигация',
  },
  common: {
    loading: 'Загрузка...',
    cancel: 'Отмена',
    create: 'Создать',
    creating: 'Создание...',
    delete: 'Удалить',
    close: 'Закрыть',
    cards: 'карточек',
    new: 'Новые',
    review: 'Повторение',
    addWord: 'Добавить слово',
    createNew: '+ Создать',
    loadFailed: 'Не удалось загрузить данные',
    back: 'Назад',
    retry: 'Повторить',
  },
  toast: {
    wordAdded: 'Слово добавлено',
    deckCreated: 'Колода создана',
    deckDeleted: 'Колода удалена',
    cardDeleted: 'Карточка удалена',
    reviewFailed: 'Не удалось сохранить результат',
  },
  home: {
    welcome: 'Добро пожаловать',
    subtitle: 'Изучайте японский эффективно',
    dueCards: '{count} карточек на повторение',
    dueCardsLabel: 'карточек на повторение',
    startStudy: 'Начать обучение',
    addNewWord: 'Добавить слово',
    decks: 'Колоды',
    noDecks: 'Пока нет колод',
    createFirst: 'Создайте первую колоду',
  },
  study: {
    loadingCards: 'Загрузка карточек...',
    complete: 'Отличная работа!',
    reviewedToday: 'Сегодня вы повторили {count} карточек',
    goHome: 'На главную',
    remaining: 'Осталось: {count}',
    showAnswer: 'Показать ответ',
    again: 'Снова',
    hard: 'Сложно',
    good: 'Хорошо',
    easy: 'Легко',
    noCardsTitle: 'Нет карточек для повторения',
    noCardsDesc: 'Попробуйте добавить новые слова',
    allReviewedTitle: 'Всё повторено!',
    allReviewedDesc: 'Сейчас нет карточек для повторения. Вернитесь позже или добавьте новые слова.',
    selectDeck: 'Выберите колоду',
    selectDeckDesc: 'Выберите колоду для изучения',
    endSession: 'Завершить',
    undo: 'Отменить',
    cardProgress: '{current} / {total}',
    studyAgain: 'Учить снова',
    tapToReveal: 'Нажмите или пробел, чтобы показать',
  },
  add: {
    title: 'Добавить слово',
    searchPlaceholder: 'Поиск на японском или английском...',
    searching: 'Поиск...',
    common: 'Частое',
    preview: 'Просмотр',
    targetDeck: 'Добавить в колоду:',
    adding: 'Добавление...',
    addToDeck: 'Добавить в колоду',
    createDeckFirst: 'Сначала создайте колоду',
    createDeck: 'Создать колоду',
    noResults: 'Слова не найдены',
    noResultsFor: 'По запросу «{query}» ничего не найдено',
    alreadyAdded: 'Уже в этой колоде',
    addAnother: 'Добавить ещё',
    clearSearch: 'Очистить поиск',
  },
  decks: {
    title: 'Колоды',
    empty: 'Пока нет колод',
    emptyDesc: 'Создайте колоду и начните добавлять слова',
    createTitle: 'Создать колоду',
    nameLabel: 'Название',
    namePlaceholder: 'Например: JLPT N3',
    descLabel: 'Описание',
    descPlaceholder: 'Описание колоды (необязательно)',
    nameRequired: 'Введите название колоды',
    createFailed: 'Не удалось создать колоду',
    notFound: 'Колода не найдена',
    backToList: 'К списку колод',
    studyCount: 'Учить ({count})',
    addWordShort: '+ Добавить',
    totalCards: 'Всего карточек',
    newCards: 'Новых',
    dueCards: 'На повторение',
    cardList: 'Карточки',
    showCards: 'Показать карточки',
    hideCards: 'Скрыть карточки',
    noCards: 'Пока нет карточек',
    deleteConfirm: 'Удалить "{name}"? Это нельзя отменить.',
    deleteConfirmWithCount: 'Удалить «{name}» и {count} карточек? Это нельзя отменить.',
    deleteFailed: 'Не удалось удалить',
    dueCardAria: '{count} карточек на повторение',
  },
  flashcard: {
    meanings: 'Значения',
    examples: 'Примеры',
    kanji: 'Кандзи',
  },
  card: {
    notFound: 'Карточка не найдена',
    backToDeck: 'Вернуться к колоде',
    deleteConfirm: 'Удалить эту карточку? Это нельзя отменить.',
    deleteFailed: 'Не удалось удалить карточку',
    dueDate: 'Дата повторения',
    interval: 'Интервал',
    repetitions: 'Повторений',
    easeFactor: 'Коэффициент',
    days: 'дней',
    srs: 'Интервальное повторение',
    strokes: 'черт: {count}',
    onReading: 'Он',
    kunReading: 'Кун',
  },
  wordPreview: {
    common: 'Частое',
    meanings: 'Значения',
    otherForms: 'Другие формы',
    examples: 'Примеры предложений',
    loadingExamples: 'Загрузка примеров...',
    noExamples: 'Примеры не найдены',
    examplesError: 'Не удалось загрузить примеры',
    play: 'Воспроизвести',
    stop: 'Остановить',
  },
  login: {
    tagline: 'Учите японский с интервальным повторением',
    modeSignIn: 'Войти',
    modeRegister: 'Регистрация',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Минимум 8 символов',
    nameLabel: 'Отображаемое имя',
    namePlaceholder: 'Необязательно',
    submitSignIn: 'Войти',
    submitRegister: 'Создать аккаунт',
    submittingSignIn: 'Вход...',
    submittingRegister: 'Создание...',
    switchToRegister: 'Нет аккаунта? Создать',
    switchToSignIn: 'Уже есть аккаунт? Войти',
    note: 'Колоды остаются приватными в рамках вашего аккаунта.',
    error: 'Что-то пошло не так. Попробуйте снова.',
    invalidCredentials: 'Неверная почта или пароль.',
    emailExists: 'Аккаунт с такой почтой уже существует.',
    passwordTooShort: 'Пароль должен быть не короче 8 символов.',
    invalidEmail: 'Введите корректный email.',
  },
  auth: {
    signOut: 'Выйти',
    loading: 'Загрузка аккаунта...',
  },
  theme: {
    toLight: 'Светлая тема',
    toNight: 'Тёмная тема',
  },
  import: {
    title: 'Импорт из текста',
    description: 'Вставьте японский текст. Мы извлечём знаменательные слова (существительные, глаголы, прилагательные) и создадим карточку для каждого.',
    textareaLabel: 'Японский текст',
    textareaPlaceholder: 'Вставьте предложение, абзац или более длинный отрывок на японском...',
    targetDeck: 'Добавить в колоду:',
    parse: 'Извлечь слова',
    parsing: 'Извлечение...',
    reparse: 'Извлечь снова',
    noWordsFound: 'В тексте не найдено знаменательных слов.',
    parseError: 'Не удалось извлечь слова. Попробуйте ещё раз.',
    foundCount: 'Найдено слов: {count}',
    selectAll: 'Выбрать все',
    selectNone: 'Снять выбор',
    alreadyInDeck: 'Уже в колоде',
    create: 'Создать карточек: {count}',
    creating: 'Создание...',
    createdCount: 'Создано карточек: {count}',
    createFailed: 'Не удалось создать карточки',
    skippedCount: 'Пропущено: {count}',
    failedCount: 'С ошибкой: {count}',
    textTooLong: 'Текст слишком длинный (максимум 5000 символов)',
    needDeck: 'Сначала выберите колоду',
    statusAdded: 'Добавлено',
    progressLabel: 'Прогресс импорта',
    statusSkipped: 'Уже в колоде',
    statusFailed: 'Не найдено',
    alreadyInDeckCount: '{count} уже в колоде',
    charCount: '{count} / {max}',
  },
};

export const translations: Record<Locale, Translations> = { en, ja, ru };
