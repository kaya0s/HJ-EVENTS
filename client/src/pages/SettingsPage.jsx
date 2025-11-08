import { THEMES } from "../utils/themes";
import { useThemeStore } from "../store/useThemeStore";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-15 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your interface
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t)}
            >
              <div
                className="relative h-8 w-full rounded-md overflow-hidden"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="rounded-xl border-2 border-primary bg-base-100 shadow-2xl mb-12 p-8 flex flex-col items-center gap-6 transition-all duration-200">
          <h4 className="text-2xl font-bold text-primary mb-2">
            Preview Title
          </h4>
          <button className="btn btn-primary text-lg px-8 py-2 shadow-md">
            Primary Action
          </button>
          <input
            type="text"
            className="input input-bordered w-full max-w-xs text-base text-center border-primary bg-base-200"
            placeholder="Preview input"
            readOnly
            value="Read-only"
          />
          <div className="flex gap-3 mt-4">
            <span className="badge badge-success badge-lg">Success</span>
            <span className="badge badge-error badge-lg">Error</span>
            <span className="badge badge-info badge-lg">Info</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
