"use client";

import { Moon, Sun } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/language-provider";
import { THEME_MODE_OPTIONS, THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

//--------mode-icons----//
const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
};

const MODE_LABEL_KEYS: Record<ThemeMode, "navigation.themeModeLight" | "navigation.themeModeDark"> = {
  light: "navigation.themeModeLight",
  dark: "navigation.themeModeDark",
};
//-------end-mode-icons----//

export function ThemeSwitcher() {
  const { t } = useI18n();
  const { themeMode, themePreset, resolvedThemeMode, setPreference } = usePreferencesStore(
    useShallow((state) => ({
      themeMode: state.values.theme_mode,
      themePreset: state.values.theme_preset,
      resolvedThemeMode: state.resolvedThemeMode,
      setPreference: state.setPreference,
    })),
  );

  const CurrentIcon = MODE_ICONS[themeMode] ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" aria-label={t("navigation.themeMenu")}>
          <CurrentIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {/* //--------theme-mode----// */}
        <DropdownMenuLabel>{t("navigation.themeMode")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={themeMode}
          onValueChange={(value) => setPreference("theme_mode", value as ThemeMode)}
        >
          {THEME_MODE_OPTIONS.map((option) => {
            const Icon = MODE_ICONS[option.value];

            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon />
                {t(MODE_LABEL_KEYS[option.value])}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        {/* //-------end-theme-mode----// */}
        <DropdownMenuSeparator />
        {/* //--------theme-preset----// */}
        <DropdownMenuLabel>{t("navigation.themePreset")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={themePreset}
          onValueChange={(value) => setPreference("theme_preset", value as ThemePreset)}
        >
          {THEME_PRESET_OPTIONS.map((preset) => (
            <DropdownMenuRadioItem key={preset.value} value={preset.value}>
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: resolvedThemeMode === "dark" ? preset.primary.dark : preset.primary.light,
                }}
              />
              {preset.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {/* //-------end-theme-preset----// */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
