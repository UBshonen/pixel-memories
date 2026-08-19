/**
 * 글자를 클립보드에 복사한다.
 *
 * `navigator.clipboard`는 **보안 컨텍스트에서만** 동작한다.
 * https 또는 localhost는 되지만, 폰에서 `http://192.168.x.x:3000` 으로
 * 접속해 테스트할 때는 아예 없는 값이 된다.
 *
 * 그래서 옛날 방식(execCommand)을 대비책으로 둔다.
 * 배포하면 https이므로 첫 번째 방법이 쓰인다.
 */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 사용자가 권한을 막았을 수 있다. 아래 방법으로 다시 시도한다.
    }
  }

  return copyWithTextarea(text);
}

/**
 * 화면 밖에 임시 입력칸을 만들어 선택한 뒤 복사한다.
 *
 * execCommand는 더 이상 권장되지 않지만, 보안 컨텍스트가 아닐 때 쓸 수 있는
 * 유일한 방법이라 남겨둔다.
 */
function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);

  try {
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * 이 페이지 링크를 공유한다.
 *
 * 폰에서는 기본 공유 시트가 열리고, 안 되면 링크를 복사한다.
 *
 * @returns 공유창이 열렸으면 "shared", 복사만 됐으면 "copied", 둘 다 실패면 "failed"
 */
export async function shareLink(
  title: string,
  text: string,
): Promise<"shared" | "copied" | "failed"> {
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      // 사용자가 공유창을 닫은 경우는 실패가 아니다. 조용히 끝낸다.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  return (await copyText(url)) ? "copied" : "failed";
}
