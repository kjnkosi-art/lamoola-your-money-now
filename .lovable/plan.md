

## Fix: Modal Layout Overflow

Both modals use `DialogContent` with `sm:max-w-xl` or `sm:max-w-2xl` classes. The table overflows because the modal isn't wide enough and lacks proper overflow containment.

### Changes

**`src/components/admin/ReshareLoginsModal.tsx`** (line ~174):
- Change `className="sm:max-w-2xl"` to `className="sm:max-w-3xl min-w-[600px] max-w-[95vw]"`
- The table wrapper already has `overflow-auto`, so horizontal scroll is handled

**`src/components/TempPasswordModal.tsx`** (line ~63):
- Change `className="sm:max-w-xl"` to `className="sm:max-w-3xl min-w-[600px] max-w-[95vw]"`

**Both modals**: Add `overflow-hidden` to the `DialogContent` to ensure nothing escapes the boundary, and ensure the inner content uses `overflow-x-auto` on the table wrapper (already present).

On screens narrower than 600px, `max-w-[95vw]` will cap the modal width and the existing `overflow-auto` on the table div enables horizontal scrolling. Footer buttons are already inside `DialogFooter` so they'll stay within bounds once the modal itself is properly sized.

No functionality changes — layout only.

