export interface Language {
    label: string;
    code: string;
    nativeName?: string;
}

export const LANGUAGES: Language[] = [
    { label: 'English', code: 'english', nativeName: 'English' },
    { label: 'Spanish', code: 'spanish', nativeName: 'Español' },
    { label: 'French', code: 'french', nativeName: 'Français' },
    { label: 'German', code: 'german', nativeName: 'Deutsch' },
    { label: 'Italian', code: 'italian', nativeName: 'Italiano' },
    { label: 'Portuguese', code: 'portuguese', nativeName: 'Português' },
    { label: 'Russian', code: 'russian', nativeName: 'Русский' },
    { label: 'Japanese', code: 'japanese', nativeName: '日本語' },
    { label: 'Chinese', code: 'chinese', nativeName: '中文' },
    { label: 'Korean', code: 'korean', nativeName: '한국어' },
    { label: 'Arabic', code: 'arabic', nativeName: 'العربية' },
    { label: 'Hindi', code: 'hindi', nativeName: 'हिन्दी' },
    { label: 'Turkish', code: 'turkish', nativeName: 'Türkçe' },
    { label: 'Dutch', code: 'dutch', nativeName: 'Nederlands' },
    { label: 'Polish', code: 'polish', nativeName: 'Polski' },
    { label: 'Swedish', code: 'swedish', nativeName: 'Svenska' },
    { label: 'Norwegian', code: 'norwegian', nativeName: 'Norsk' },
    { label: 'Finnish', code: 'finnish', nativeName: 'Suomi' },
    { label: 'Greek', code: 'greek', nativeName: 'Ελληνικά' },
    { label: 'Hebrew', code: 'hebrew', nativeName: 'עברית' },
];