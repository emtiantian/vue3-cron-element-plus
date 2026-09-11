# Project decisions

Package: @emtt/vue3-cron-element-plus. Scope belongs to the user's npm organization; GitHub account is emtiantian. A remote repository has not been created or verified.

User owns the reference component at packages/aigc-apps-platform/src/components/cron in the local ui-aigc-apps-next project and selected MIT. This implementation retains the tab/mode interaction while separating cron semantics from rendering and removing application-specific styles.

Support unix (default five fields), unix-seconds and quartz (six fields). No year, L, W or # in 0.1.0. Both visible fields and per-field modes are configurable and nonempty. Hidden fields preserve values except the required Quartz day/weekday counterpart adjustment. Invalid input is never silently replaced.

Vue and Element Plus are peer/external dependencies. TypeScript strict, plain CSS variables, pnpm, Vite, bilingual README. Manual npm release; CI does not publish. Playground is ready for a future GitHub Pages deployment after repository setup.

2026-09-11: Default component locale is zh-CN (project-specific override). Configured editors remain visible together; input edits activate their rule. Every is a toggleable select-all checkbox. Clearing all preserves the last valid model and shows a selection error until corrected.

Default component format updated to unix-seconds; seconds defaults to step/specific editors. Select all is integrated into specific values and emits *. Explicit unix still supports five fields. Core utility format defaults remain unix for compatibility; pass format explicitly when using six fields.
