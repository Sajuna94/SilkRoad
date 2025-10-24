import { useEffect, useState } from "react";

export function useSrcsetMap() {
    const [srcsetMap, setSrcsetMap] = useState<Record<string, string[]>>({});

    useEffect(() => {
        fetch("/SilkRoad/images/compressed/srcset.json")
            .then((res) => res.json())
            .then((data) => setSrcsetMap(data))
            .catch((err) => console.error("載入 srcsetMap 失敗", err));
    }, []);

    return srcsetMap;
}
