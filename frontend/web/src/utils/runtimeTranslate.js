const cache = new Map();

export async function runtimeTranslate(text, targetLang = "en") {
    if (!text || typeof text !== "string") return text;

    //  Do NOT translate English
    if (targetLang === "en") return text;

    //  Allow ONLY Hindi & Bengali , Kokborok
    if (!["hi", "bn", "trp"].includes(targetLang)) return text;

    const key = targetLang + "|" + text;
    if (cache.has(key)) return cache.get(key);

    try {
        const url =
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
            targetLang +
            "&dt=t&q=" +
            encodeURIComponent(text);

        const res = await fetch(url);
        const data = await res.json();

        const translated = data[0].map((item) => item[0]).join("");

        cache.set(key, translated);
        return translated;
    } catch (e) {
        console.warn("Translate failed", e);
        return text;
    }
}