import { useLanguage } from "@/providers/language.provider";
import en from "./en";
import vi from "./vi";

const dictionaries = { en, vi };

type NestedKeyOf<ObjectType extends object> =
    { [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`
    }[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

export function useTranslation() {
    // Thêm giá trị mặc định nếu context bị null
    const context = useLanguage();
    const language = context?.language || 'en'; // Nếu context null (lúc build), dùng 'en' làm mặc định

    const dictionary = dictionaries[language as keyof typeof dictionaries] || dictionaries.en;

    const t = (key: TranslationKey | string, variables?: Record<string, string | number>) => {
        const keys = key.split('.');
        let value: any = dictionary;

        for (const k of keys) {
            if (value === undefined || value === null) break;
            value = value[k as keyof typeof value];
        }

        // ... phần logic còn lại giữ nguyên ...
        if (typeof value === 'string') {
            if (variables) {
                return value.replace(/{(\w+)}/g, (_, v) => String(variables[v] ?? `{${v}}`));
            }
            return value;
        }

        // Fallback to English
        if (language !== 'en') {
            let enValue: any = en;
            for (const k of keys) {
                if (enValue === undefined || enValue === null) break;
                enValue = enValue[k as keyof typeof enValue];
            }
            if (typeof enValue === 'string') {
                return variables
                    ? enValue.replace(/{(\w+)}/g, (_, v) => String(variables[v] ?? `{${v}}`))
                    : enValue;
            }
        }

        return key;
    };

    return { t, language };
}