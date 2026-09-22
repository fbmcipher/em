package com.emtheapp.em;

import android.view.View;
import androidx.annotation.NonNull;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsAnimationCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

/**
 * Streams the live, per-frame height of the Android virtual keyboard (IME) to the web layer.
 *
 * Unlike @capacitor/keyboard — which only reports the keyboard's final height at
 * keyboardWillShow/keyboardDidShow — this plugin uses WindowInsetsAnimationCompat.onProgress,
 * which fires every frame of the IME open/close animation with the keyboard's actual current
 * inset. This lets us drive UI elements with the real keyboard position over time instead of
 * approximating iOS/Android's animation curve with a spring.
 *
 * The height is emitted in CSS pixels (physical px / display density) to match the units used by
 * @capacitor/keyboard and the web positioning math.
 */
@CapacitorPlugin(name = "VirtualKeyboardTracker")
public class VirtualKeyboardTracker extends Plugin {
    @Override
    public void load() {
        final View decorView = getActivity().getWindow().getDecorView();
        final float density = getContext().getResources().getDisplayMetrics().density;

        // Registration during plugin load delivered no progress on Android 17 in the diagnostic run.
        // Attach after window focus, when activity and WebView inset setup is complete.
        decorView.getViewTreeObserver().addOnWindowFocusChangeListener(hasFocus -> {
            if (hasFocus) decorView.post(() -> installCallback(decorView, density));
        });
        if (decorView.hasWindowFocus()) decorView.post(() -> installCallback(decorView, density));
    }

    /** Installs a per-frame IME observer on the window's decor view while preserving child dispatch. */
    private void installCallback(View decorView, float density) {
        ViewCompat.setWindowInsetsAnimationCallback(
            decorView,
            new WindowInsetsAnimationCompat.Callback(WindowInsetsAnimationCompat.Callback.DISPATCH_MODE_CONTINUE_ON_SUBTREE) {
                @NonNull
                @Override
                public WindowInsetsCompat onProgress(
                    @NonNull WindowInsetsCompat insets,
                    @NonNull List<WindowInsetsAnimationCompat> runningAnimations
                ) {
                    // Only react to frames of the IME (keyboard) animation, ignoring status/nav bar animations.
                    boolean imeAnimating = false;
                    for (WindowInsetsAnimationCompat animation : runningAnimations) {
                        if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) {
                            imeAnimating = true;
                            break;
                        }
                    }
                    if (imeAnimating) {
                        emitHeight(insets, density);
                    }
                    return insets;
                }

                @Override
                public void onEnd(@NonNull WindowInsetsAnimationCompat animation) {
                    // Emit the resting height once the animation settles, so the final frame is never missed.
                    if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) {
                        WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(decorView);
                        if (rootInsets != null) {
                            emitHeight(rootInsets, density);
                        }
                    }
                }
            }
        );
    }

    /** Emits the current IME height (in CSS pixels) as a keyboardProgress event. */
    private void emitHeight(@NonNull WindowInsetsCompat insets, float density) {
        int imeHeightPx = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom;
        double imeHeightCss = imeHeightPx / density;

        JSObject data = new JSObject();
        data.put("height", imeHeightCss);
        notifyListeners("keyboardProgress", data);
    }
}
