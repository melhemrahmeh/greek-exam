import { emptyStoredState } from "../features/study/constants";
import { normalizeStoredState } from "../features/study/utils";
import type { StoredState } from "../features/study/types";

const CURRENT_USER_KEY = "greek-exam:current-user";
const progressKey = (name: string) => `greek-exam:progress:${name.toLowerCase()}`;

function read(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, quota); progress just won't persist.
  }
}

export function loadCurrentUser() {
  return read(CURRENT_USER_KEY)?.trim() || null;
}

export function saveCurrentUser(name: string | null) {
  write(CURRENT_USER_KEY, name);
}

export function loadProgress(name: string): StoredState {
  const raw = read(progressKey(name));
  if (!raw) return emptyStoredState;
  try {
    return normalizeStoredState(JSON.parse(raw) as Partial<StoredState>);
  } catch {
    return emptyStoredState;
  }
}

export function saveProgress(name: string, state: StoredState) {
  write(progressKey(name), JSON.stringify(state));
}
