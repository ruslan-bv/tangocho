export type Locale = 'en' | 'ja' | 'ru';

export interface Translations {
  nav: {
    home: string;
    decks: string;
    study: string;
    add: string;
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
    deleteFailed: string;
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
  };
  wordPreview: {
    common: string;
    meanings: string;
    otherForms: string;
    examples: string;
    loadingExamples: string;
    noExamples: string;
  };
}

export const en: Translations = {
  nav: {
    home: 'Home',
    decks: 'Decks',
    study: 'Study',
    add: 'Add',
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
    deleteFailed: 'Failed to delete',
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
  },
  wordPreview: {
    common: 'Common',
    meanings: 'Meanings',
    otherForms: 'Other Forms',
    examples: 'Example Sentences',
    loadingExamples: 'Loading examples...',
    noExamples: 'No example sentences found',
  },
};

export const ja: Translations = {
  nav: {
    home: 'ホーム',
    decks: 'デッキ',
    study: '学習',
    add: '追加',
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
    deleteFailed: '削除に失敗しました',
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
  },
  wordPreview: {
    common: '常用',
    meanings: '意味',
    otherForms: '他の形',
    examples: '例文',
    loadingExamples: '例文を読み込み中...',
    noExamples: '例文が見つかりませんでした',
  },
};

export const ru: Translations = {
  nav: {
    home: 'Главная',
    decks: 'Колоды',
    study: 'Учить',
    add: 'Добавить',
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
    deleteFailed: 'Не удалось удалить',
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
  },
  wordPreview: {
    common: 'Частое',
    meanings: 'Значения',
    otherForms: 'Другие формы',
    examples: 'Примеры предложений',
    loadingExamples: 'Загрузка примеров...',
    noExamples: 'Примеры не найдены',
  },
};

export const translations: Record<Locale, Translations> = { en, ja, ru };
