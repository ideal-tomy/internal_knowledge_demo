import { useEffect, useState } from "react";

type ViewportBox = {
  height: number;
  offsetTop: number;
};

/**
 * iOS Safari などでキーボード表示時に visualViewport へ追従する。
 * 100vh ではなく、実表示領域の高さ＋offsetTop を返す。
 */
export function useVisualViewportHeight(): ViewportBox {
  const read = (): ViewportBox => {
    const vv = window.visualViewport;
    if (vv) {
      return { height: vv.height, offsetTop: vv.offsetTop };
    }
    return { height: window.innerHeight, offsetTop: 0 };
  };

  const [box, setBox] = useState<ViewportBox>(() =>
    typeof window === "undefined"
      ? { height: 0, offsetTop: 0 }
      : read(),
  );

  useEffect(() => {
    const update = () => setBox(read());
    update();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return box;
}
