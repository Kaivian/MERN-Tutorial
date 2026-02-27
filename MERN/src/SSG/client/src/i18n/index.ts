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
    const { language } = useLanguage();
    const dictionary = dictionaries[language];

    const t = (key: TranslationKey | string, variables?: Record<string, string | number>) => {
        const keys = key.split('.');
        let value: any = dictionary;

        for (const k of keys) {
            if (value === undefined) break;
            value = value[k as keyof typeof value];
        }

        if (typeof value === 'string') {
            if (variables) {
                return value.replace(/{(\w+)}/g, (_, v) => String(variables[v] ?? `{${v}}`));
            }
            return value;
        }

        // Fallback to English key if not found in current language
        if (language !== 'en') {
            let enValue: any = en;
            for (const k of keys) {
                if (enValue === undefined) break;
                enValue = enValue[k as keyof typeof enValue];
            }
            if (typeof enValue === 'string') {
                if (variables) {
                    return enValue.replace(/{(\w+)}/g, (_, v) => String(variables[v] ?? `{${v}}`));
                }
                return enValue;
            }
        }

        return key;
    };

    return { t, language };
}
