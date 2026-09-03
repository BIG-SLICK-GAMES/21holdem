const PATCH_FLAG = '__bsgClosedAudioContextGuard';

function isClosedAudioContext(context) {
    return !context || context.state === 'closed';
}

function isClosedAudioContextError(error) {
    return /closed AudioContext/i.test(String(error?.message || error || ''));
}

function safeAudioContextCall(context, methodName) {
    if (isClosedAudioContext(context) || typeof context[methodName] !== 'function') return;

    try {
        const result = context[methodName]();
        if (result?.catch) {
            result.catch((error) => {
                if (!isClosedAudioContextError(error)) console.error(error);
            });
        }
    } catch (error) {
        if (!isClosedAudioContextError(error)) console.error(error);
    }
}

function removeUnlockListeners(body, unlockHandler) {
    if (!body) return;
    body.removeEventListener('touchstart', unlockHandler);
    body.removeEventListener('touchend', unlockHandler);
    body.removeEventListener('mousedown', unlockHandler);
    body.removeEventListener('mouseup', unlockHandler);
    body.removeEventListener('keydown', unlockHandler);
}

export default function installPhaserAudioContextGuard(Phaser) {
    const webAudioPrototype = Phaser?.Sound?.WebAudioSoundManager?.prototype;
    if (!webAudioPrototype || webAudioPrototype[PATCH_FLAG]) return;

    webAudioPrototype[PATCH_FLAG] = true;

    webAudioPrototype.onGameVisible = function onGameVisible() {
        window.setTimeout(() => {
            const context = this.context;
            if (isClosedAudioContext(context)) return;

            safeAudioContextCall(context, 'suspend');
            safeAudioContextCall(context, 'resume');
        }, 100);
    };

    webAudioPrototype.onBlur = function onBlur() {
        if (!this.locked) safeAudioContextCall(this.context, 'suspend');
    };

    webAudioPrototype.onFocus = function onFocus() {
        const context = this.context;
        if (!this.locked && (context?.state === 'suspended' || context?.state === 'interrupted')) {
            safeAudioContextCall(context, 'resume');
        }
    };

    webAudioPrototype.unlock = function unlock() {
        const body = document.body;
        const unlockHandler = () => {
            const context = this.context;
            if (isClosedAudioContext(context)) {
                removeUnlockListeners(body, unlockHandler);
                return;
            }

            try {
                const result = context.resume();
                if (result?.then) {
                    result.then(() => {
                        removeUnlockListeners(body, unlockHandler);
                        this.unlocked = true;
                    }).catch(() => removeUnlockListeners(body, unlockHandler));
                }
            } catch (_error) {
                removeUnlockListeners(body, unlockHandler);
            }
        };

        if (body) {
            body.addEventListener('touchstart', unlockHandler, false);
            body.addEventListener('touchend', unlockHandler, false);
            body.addEventListener('mousedown', unlockHandler, false);
            body.addEventListener('mouseup', unlockHandler, false);
            body.addEventListener('keydown', unlockHandler, false);
        }
    };
}
