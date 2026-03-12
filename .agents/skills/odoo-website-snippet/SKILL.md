---
name: odoo-website-snippet
description: Standards for structuring and naming multiple Website Builder snippets in a single Odoo module (Odoo 18). Use when adding new snippets, organizing views/options/assets per component, enforcing unique classes, and registering snippets in the drag-and-drop editor.
---

# Skill: Website Snippet Module Structure (Odoo 18)

Use this skill when building **multiple snippets** inside one module (e.g. `nti_web_snippet`) to keep it clean, scalable, and maintainable.

## Goals

- Each snippet has its own **view**, **SCSS**, and **JS** per component.
- Provide a place for **shared/general** utilities without duplication.
- All classes/selectors are **unique** to avoid collisions with core/theme/other snippets.
- Consistent registration in Website Builder (Blocks modal + Customize options + asset bundles).

## Recommended folder structure

```
<module_name>/
├── __manifest__.py
├── views/
│   └── snippets/
│       ├── snippets.xml                # snippet list (appears in Blocks modal)
│       ├── options.xml                 # customize options (global for module)
│       ├── s_<snippet_a>.xml           # template snippet A (template only)
│       ├── s_<snippet_b>.xml           # template snippet B (template only)
│       └── ...
└── static/
    └── src/
        ├── img/
        │   └── snippets_thumbs/
        │       ├── s_<snippet_a>.svg
        │       └── ...
        ├── shared/                     # OPTIONAL: shared util across snippets
        │   ├── js/*.js
        │   └── scss/*.scss
        └── snippets/
            ├── s_<snippet_a>/
            │   ├── 000.scss
            │   └── 000.js              # optional if needed
            ├── s_<snippet_b>/
            │   ├── 000.scss
            │   └── 000.js
            └── ...
```

## Naming rules (MUST)

- **Snippet ID**: `s_<prefix>_<name>` (e.g. `s_nti_marquee`)
- **QWeb template**: `<template id="s_<...>"> ... </template>`
- **Section class**: `.s_<prefix>_<name>` (e.g. `.s_nti_marquee`)
- **Internal classes** must be prefixed per module to be unique:
  - Format: `<module>__<component>__<part>` (BEM-ish)
  - Example: `.nti_web_snippet__marquee__track`, `.nti_web_snippet__marquee__item`
- **Do NOT** use generic classes like `.track`, `.item`, `.marquee` without a prefix.

## File split (core rule)

- `views/snippets/s_<snippet>.xml`
  - Contains **snippet template only**
  - Do not put `<template inherit_id="website.snippet_options">` here
- `views/snippets/options.xml`
  - Put all `<template id="..._options" inherit_id="website.snippet_options">` here
  - If it grows, you may split by feature (e.g. `options_marquee.xml`) but keep them under `views/snippets/`
- `static/src/snippets/s_<snippet>/000.scss` and `000.js`
  - Snippet-specific SCSS/JS
- `static/src/shared/*`
  - Shared helpers used by multiple snippets (e.g. throttle, sizing utilities, SCSS mixins).

## Registering snippets in the Blocks modal

In `views/snippets/snippets.xml`:
- Inherit `website.snippets`
- Insert into `//snippets[@id='snippet_structure']` (main blocks) or `snippet_content` (inner content)
- Use `t-thumbnail` pointing to your module thumbnail
- Ensure `t-snippet="module_name.s_<snippet>"` is correct

Example:

```xml
<template id="my_snippets" inherit_id="website.snippets">
  <xpath expr="//snippets[@id='snippet_structure']" position="inside">
    <t t-snippet="my_module.s_my_snippet"
       string="My Snippet"
       group="content"
       t-thumbnail="/my_module/static/src/img/snippets_thumbs/s_my_snippet.svg"/>
  </xpath>
</template>
```

## Options (Customize) per snippet

In `views/snippets/options.xml`:
- Wrap options per snippet:
  - `<div data-selector=".s_xxx"> ... </div>`
- If you need a dedicated editor widget, use:
  - `<div data-js="SomeWidget" data-selector=".s_xxx" .../>`
- For “Add item” UX (easy add/replace images), use the `MultipleItems` pattern:
  - `data-js="MultipleItems"`
  - `data-target` points to the container where items are duplicated
  - `we-button` with `data-add-item` + `data-item=".item:last"`

## Inner Snippets (Inline content)

When creating widgets that drop inside existing columns or texts (Inner Snippets), follow these two extra steps:

1. **Register under Inner Content**:
In `snippets.xml`, inject your snippet into `//snippets[@id='snippet_content']` instead of `snippet_structure`.

2. **Make it Droppable (CRITICAL)**:
By default, Odoo blocks dropping custom `.s_xxx` inner snippets on the page ("This block cannot be dropped anywhere on this page."). 
To authorize it, you MUST inject your selector into `so_content_addition_selector` inside your `views/snippets/options.xml` file (which inherits `website.snippet_options`):
```xml
<template id="my_snippet_options" inherit_id="website.snippet_options">
    <xpath expr="." position="inside">
        <!-- your customizable options -->
    </xpath>

    <!-- Allow Drop anywhere for Inner Snippets -->
    <xpath expr="//t[@t-set='so_content_addition_selector']" position="inside" t-translation="off">, .s_<name></xpath>
</template>
```

## Assets

In `__manifest__.py`:
- Website snippets typically go into `web.assets_frontend`
- To avoid editing the manifest for each new snippet, use wildcards:

```python
"assets": {
  "web.assets_frontend": [
    "<module>/static/src/shared/js/**/*.js",
    "<module>/static/src/shared/scss/**/*.scss",
    "<module>/static/src/snippets/**/*.js",
    "<module>/static/src/snippets/**/*.scss",
  ],
},
```

Note:
- If a snippet requires editor-side logic (snippet options JS via `@web_editor/js/editor/snippets.options`), it usually belongs in `website.assets_wysiwyg`. Only use this when required.

## Quality checklist (before finishing)

- [ ] Snippet has a `section` or container with `class="s_..."` + `data-snippet="..."` + `data-name="..."`
- [ ] All internal classes have a unique module prefix (no collisions)
- [ ] Options are defined in `views/snippets/options.xml` with appropriate selectors
- [ ] Thumbnail is available and `t-thumbnail` path is valid
- [ ] Assets are properly loaded (in `web.assets_frontend` bundle) and throw no errors
- [ ] If DOM duplication is used (e.g., clone for seamless loops), ensure it updates on content change (`MutationObserver`) and resize (`ResizeObserver`)

## Official Core References

Whenever you are building a new snippet or need examples of advanced options, CSS classes, or Editor JS interactions, always use the core Odoo 18 snippets as an active reference guide.

**Local Core Snippets Path**:
`addons\website\static\src\snippets`
