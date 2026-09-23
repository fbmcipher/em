package com.emtheapp.em;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsAnimation;
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
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            decorView.setWindowInsetsAnimationCallback(
                new WindowInsetsAnimation.Callback(WindowInsetsAnimation.Callback.DISPATCH_MODE_CONTINUE_ON_SUBTREE) {
                    @Override
                    public WindowInsets onProgress(WindowInsets insets, List<WindowInsetsAnimation> runningAnimations) {
                        for (WindowInsetsAnimation animation : runningAnimations) {
                            if ((animation.getTypeMask() & WindowInsets.Type.ime()) != 0) {
                                emitHeight(
                                    insets.getInsets(WindowInsets.Type.ime()).bottom,
                                    insets.getInsets(WindowInsets.Type.navigationBars()).bottom,
                                    Build.VERSION.SDK_INT >= 35 ? insets.getFrame().getHeight() : decorView.getHeight(),
                                    animation.getInterpolatedFraction(),
                                    density,
                                    decorView
                                );
                                break;
                            }
                        }
                        return insets;
                    }

                    @Override
                    public void onEnd(WindowInsetsAnimation animation) {
                        if ((animation.getTypeMask() & WindowInsets.Type.ime()) != 0) {
                            WindowInsets rootInsets = decorView.getRootWindowInsets();
                            if (rootInsets != null) {
                                emitHeight(
                                    rootInsets.getInsets(WindowInsets.Type.ime()).bottom,
                                    rootInsets.getInsets(WindowInsets.Type.navigationBars()).bottom,
                                    Build.VERSION.SDK_INT >= 35 ? rootInsets.getFrame().getHeight() : decorView.getHeight(),
                                    1.0f,
                                    density,
                                    decorView
                                );
                            }
                        }
                    }
                }
            );
            return;
        }

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
                    WindowInsetsAnimationCompat imeAnimation = null;
                    for (WindowInsetsAnimationCompat animation : runningAnimations) {
                        if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) {
                            imeAnimation = animation;
                            break;
                        }
                    }
                    if (imeAnimation != null) {
                        emitHeight(
                            insets.getInsets(WindowInsetsCompat.Type.ime()).bottom,
                            insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom,
                            decorView.getHeight(),
                            imeAnimation.getInterpolatedFraction(),
                            density,
                            decorView
                        );
                    }
                    return insets;
                }

                @Override
                public void onEnd(@NonNull WindowInsetsAnimationCompat animation) {
                    // Emit the resting height once the animation settles, so the final frame is never missed.
                    if ((animation.getTypeMask() & WindowInsetsCompat.Type.ime()) != 0) {
                        WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(decorView);
                        if (rootInsets != null) {
                            emitHeight(
                                rootInsets.getInsets(WindowInsetsCompat.Type.ime()).bottom,
                                rootInsets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom,
                                decorView.getHeight(),
                                1.0f,
                                density,
                                decorView
                            );
                        }
                    }
                }
            }
        );
    }

    /** Emits the current IME height (in CSS pixels) as a keyboardProgress event. */
    private void emitHeight(int imeHeightPx, int navigationBarPx, int insetsFrameHeightPx, float fraction, float density, View decorView) {
        double imeHeightCss = imeHeightPx / density;
        int[] decorPosition = new int[2];
        decorView.getLocationOnScreen(decorPosition);

        JSObject data = new JSObject();
        data.put("height", imeHeightCss);
        data.put("nativeTimeMs", System.currentTimeMillis());
        data.put("imeHeightPx", imeHeightPx);
        data.put("navigationBarPx", navigationBarPx);
        data.put("insetsFrameHeightPx", insetsFrameHeightPx);
        data.put("fraction", fraction);
        data.put("decorHeightPx", decorView.getHeight());
        data.put("decorTopPx", decorPosition[1]);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsets rootInsets = decorView.getRootWindowInsets();
            if (rootInsets != null) {
                data.put("rootImeHeightPx", rootInsets.getInsets(WindowInsets.Type.ime()).bottom);
            }
            android.view.WindowMetrics metrics = getActivity().getWindowManager().getCurrentWindowMetrics();
            data.put("windowBoundsHeightPx", metrics.getBounds().height());
            data.put("windowMetricsImeHeightPx", metrics.getWindowInsets().getInsets(WindowInsets.Type.ime()).bottom);
        }
        notifyListeners("keyboardProgress", data);
    }
}
