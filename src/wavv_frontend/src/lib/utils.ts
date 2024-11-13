import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Reference Juno: https://github.com/junobuild/juno/blob/main/src/frontend/src/lib/utils/window.utils.ts#L4
export const popupCenter = (): string | undefined => {
  const AUTH_POPUP_WIDTH = 576;
  const AUTH_POPUP_HEIGHT = 625;

  if (typeof window === "undefined" || !window.top) {
    return undefined;
  }

  const { innerWidth, innerHeight, screenX, screenY } = window;

  const y = innerHeight / 2 + screenY - AUTH_POPUP_HEIGHT / 2;
  const x = innerWidth / 2 + screenX - AUTH_POPUP_WIDTH / 2;

  return `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${AUTH_POPUP_WIDTH}, height=${AUTH_POPUP_HEIGHT}, top=${y}, left=${x}`;
};
