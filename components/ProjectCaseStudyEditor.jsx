import { useCallback, useEffect, useRef, useState } from "react";

function RichTextArea({ value, onChange, placeholder, rows, className }) {
  const ref = useRef(null);

  const applyBold = (e) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + `**${selected}**` + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const newCursor = selected ? end + 4 : start + 2;
      el.setSelectionRange(newCursor, newCursor);
    });
  };

  const applyItalic = (e) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + `*${selected}*` + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      const newCursor = selected ? end + 2 : start + 1;
      el.setSelectionRange(newCursor, newCursor);
    });
  };

  const applyBullet = (e) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineAlreadyBulleted = value.slice(lineStart).startsWith("- ");
    if (lineAlreadyBulleted) {
      const newValue = value.slice(0, lineStart) + value.slice(lineStart + 2);
      onChange(newValue);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, start - 2)); });
    } else {
      const newValue = value.slice(0, lineStart) + "- " + value.slice(lineStart);
      onChange(newValue);
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + 2, start + 2); });
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex gap-1">
        <button
          type="button"
          onMouseDown={applyBold}
          className="rounded px-2 py-0.5 text-xs font-bold text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
          title="Bold (select text then click)"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={applyItalic}
          className="rounded px-2 py-0.5 text-xs italic text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
          title="Italic (select text then click)"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={applyBullet}
          className="rounded px-2 py-0.5 text-xs text-[var(--muted)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
          title="Bullet list (toggles current line)"
        >
          • List
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
    </div>
  );
}

const MAX_SECTION_IMAGES = 4;
const MAX_IMAGE_MB = 2;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const LAYOUT_OPTIONS = [
  { id: "text-only", label: "Text only" },
  { id: "meta-split", label: "Meta | Text" },
  { id: "label-cards", label: "Label | Cards" },
  { id: "label-detail", label: "Label | Detail" },
  { id: "label-story", label: "Label | Story" },
  { id: "image-below", label: "Text + image" },
  { id: "image-right", label: "Text | Image" },
  { id: "image-left", label: "Image | Text" },
  { id: "vision", label: "Vision" },
  { id: "full-image", label: "Image only" },
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function createSection(heading = "") {
  return { id: genId(), heading, sectionLabel: "", body: "", description: "", layout: "text-only", images: [], meta: [], cards: [], extraBlocks: [] };
}

function createBlock(layout = "text-only") {
  return { id: genId(), layout, body: "", images: [], meta: [], cards: [] };
}

export function defaultProjectSections() {
  return [
    createSection("Overview"),
    createSection("Problem & Goals"),
    createSection("Design Solution"),
    createSection("Process"),
    createSection("Results"),
  ];
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read error"));
    reader.readAsDataURL(file);
  });
}

const CLOUDINARY_CLOUD = "dvpd0p6si";
const CLOUDINARY_PRESET = "portfolio_uploads";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url;
}

function MetaEditor({ meta = [], onChange }) {
  const addItem = () => onChange([...meta, { label: "", value: "" }]);
  const removeItem = (i) => onChange(meta.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const next = [...meta];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        Meta Fields (left column)
      </label>
      <div className="space-y-2">
        {meta.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.label}
              onChange={(e) => updateItem(i, "label", e.target.value)}
              placeholder="Label (e.g. Role)"
              className="w-28 flex-shrink-0 rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-[var(--text)]"
            />
            <input
              value={item.value}
              onChange={(e) => updateItem(i, "value", e.target.value)}
              placeholder="Value"
              className="min-w-0 flex-1 rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-[var(--text)]"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="flex-shrink-0 rounded-full p-1 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
              aria-label="Remove"
            >✕</button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-dashed px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
        >
          + Add field
        </button>
      </div>
    </div>
  );
}

function CardsEditor({ cards = [], onChange, cardBodyLabel = "Body" }) {
  const addCard = () => onChange([...cards, { title: "", body: "" }]);
  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i));
  const updateCard = (i, field, val) => {
    const next = [...cards];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
        Cards
      </label>
      <div className="space-y-3">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted)]">Card {i + 1}</span>
              <button
                type="button"
                onClick={() => removeCard(i)}
                className="rounded-full p-1 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
                aria-label="Remove card"
              >✕</button>
            </div>
            <input
              value={card.title}
              onChange={(e) => updateCard(i, "title", e.target.value)}
              placeholder="Bold title"
              className="w-full rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none focus:border-[var(--text)]"
            />
            <RichTextArea
              value={card.body}
              onChange={(val) => updateCard(i, "body", val)}
              placeholder={cardBodyLabel}
              rows={3}
              className="w-full resize-y rounded-lg border bg-transparent px-2 py-1.5 text-xs leading-6 outline-none focus:border-[var(--text)]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addCard}
          className="rounded-lg border border-dashed px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
        >
          + Add card
        </button>
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange, onImageUpload, onImageRemove, uploadStatus }) {
  const isLabelCards = section.layout === "label-cards";
  const isLabelDetail = section.layout === "label-detail";
  const isLabelStory = section.layout === "label-story";
  const hasImages = !["text-only", "meta-split", "label-cards", "vision"].includes(section.layout);
  const hasBody = !["full-image", "label-cards"].includes(section.layout);
  const hasMeta = section.layout === "meta-split";
  const hasCards = isLabelCards || isLabelDetail;
  const hasDescription = isLabelStory;

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          Group <span className="normal-case opacity-60">(e.g. Defining the Problem — shown as teal overline)</span>
        </label>
        <input
          value={section.sectionLabel || ""}
          onChange={(e) => onChange({ ...section, sectionLabel: e.target.value })}
          placeholder="e.g. Defining the Problem"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
        />
        <p className="mt-1.5 text-[10px] text-[var(--muted)]">Blocks sharing the same group name appear together in the nav as one item.</p>
      </div>
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          Block Heading
        </label>
        <input
          value={section.heading}
          onChange={(e) => onChange({ ...section, heading: e.target.value })}
          placeholder="e.g. Overview"
          className="w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--text)]"
        />
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
          Layout
        </label>
        <div className="flex flex-wrap gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...section, layout: opt.id })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                section.layout === opt.id
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--on-accent)]"
                  : "text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasMeta && (
        <MetaEditor
          meta={section.meta || []}
          onChange={(updated) => onChange({ ...section, meta: updated })}
        />
      )}

      {hasBody && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            {hasMeta ? "Body Text (right column)" : (isLabelDetail || isLabelStory) ? "Bold Callout (top of right column)" : "Body Text"}
          </label>
          <RichTextArea
            value={section.body}
            onChange={(val) => onChange({ ...section, body: val })}
            placeholder={(isLabelDetail || isLabelStory) ? "e.g. Customer wants to get a refund for missing package…" : "Write content for this section..."}
            rows={(isLabelDetail || isLabelStory) ? 3 : 8}
            className="w-full resize-y rounded-xl border bg-transparent px-3 py-2.5 text-sm leading-7 outline-none focus:border-[var(--text)]"
          />
        </div>
      )}

      {hasDescription && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Story Text (regular body below callout)
          </label>
          <RichTextArea
            value={section.description || ""}
            onChange={(val) => onChange({ ...section, description: val })}
            placeholder="e.g. Sandra ordered a water dispenser from Amazon that was marked as delivered…"
            rows={4}
            className="w-full resize-y rounded-xl border bg-transparent px-3 py-2.5 text-sm leading-7 outline-none focus:border-[var(--text)]"
          />
        </div>
      )}

      {hasCards && (
        <CardsEditor
          cards={section.cards || []}
          onChange={(updated) => onChange({ ...section, cards: updated })}
          cardBodyLabel={isLabelDetail ? "Body text (shown after bold title inline)" : "Body text"}
        />
      )}

      {hasImages && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Images ({section.images.length}/{MAX_SECTION_IMAGES})
          </label>
          <div className="space-y-2">
            {section.images.map((img, imgIdx) => (
              <div key={imgIdx} className="flex items-start gap-3 rounded-xl border p-3">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--panel-soft)]">
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-xs text-[var(--muted)]">{img.name}</p>
                  <input
                    value={img.caption || ""}
                    onChange={(e) => {
                      const imgs = [...section.images];
                      imgs[imgIdx] = { ...img, caption: e.target.value };
                      onChange({ ...section, images: imgs });
                    }}
                    placeholder="Caption (optional)"
                    className="w-full rounded-lg border bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--text)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onImageRemove(imgIdx)}
                  className="flex-shrink-0 rounded-full p-1 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}

            {section.images.length < MAX_SECTION_IMAGES && (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={onImageUpload}
                />
                + Upload image{" "}
                <span className="opacity-60">(max {MAX_IMAGE_MB}MB)</span>
              </label>
            )}

            {uploadStatus && (
              <p className="text-xs text-[var(--muted)]">{uploadStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExtraBlockEditor({ block, onChange, onRemove, onImageUpload, onImageRemove, uploadStatus }) {
  const isLabelCards = block.layout === "label-cards";
  const isLabelDetail = block.layout === "label-detail";
  const isLabelStory = block.layout === "label-story";
  const hasImages = !["text-only", "meta-split", "label-cards", "vision"].includes(block.layout);
  const hasBody = !["full-image", "label-cards"].includes(block.layout);
  const hasMeta = block.layout === "meta-split";
  const hasCards = isLabelCards || isLabelDetail;
  const hasDescription = isLabelStory;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--muted)]">Block</p>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full px-2 py-1 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          Remove block
        </button>
      </div>

      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Layout</label>
        <div className="flex flex-wrap gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...block, layout: opt.id })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                block.layout === opt.id
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--on-accent)]"
                  : "text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {hasMeta && (
        <MetaEditor meta={block.meta || []} onChange={(updated) => onChange({ ...block, meta: updated })} />
      )}

      {hasBody && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            {hasMeta ? "Body Text (right column)" : (isLabelDetail || isLabelStory) ? "Bold Callout" : "Body Text"}
          </label>
          <RichTextArea
            value={block.body}
            onChange={(val) => onChange({ ...block, body: val })}
            rows={(isLabelDetail || isLabelStory) ? 3 : 6}
            className="w-full resize-y rounded-xl border bg-transparent px-3 py-2.5 text-sm leading-7 outline-none focus:border-[var(--text)]"
          />
        </div>
      )}

      {hasDescription && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Story Text (regular body below callout)
          </label>
          <RichTextArea
            value={block.description || ""}
            onChange={(val) => onChange({ ...block, description: val })}
            placeholder="e.g. Sandra ordered a water dispenser…"
            rows={4}
            className="w-full resize-y rounded-xl border bg-transparent px-3 py-2.5 text-sm leading-7 outline-none focus:border-[var(--text)]"
          />
        </div>
      )}

      {hasCards && (
        <CardsEditor
          cards={block.cards || []}
          onChange={(updated) => onChange({ ...block, cards: updated })}
          cardBodyLabel="Body text"
        />
      )}

      {hasImages && (
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
            Images ({(block.images || []).length}/{MAX_SECTION_IMAGES})
          </label>
          <div className="space-y-2">
            {(block.images || []).map((img, imgIdx) => (
              <div key={imgIdx} className="flex items-start gap-3 rounded-xl border p-3">
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--panel-soft)]">
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-xs text-[var(--muted)]">{img.name}</p>
                  <input
                    value={img.caption || ""}
                    onChange={(e) => {
                      const imgs = [...block.images];
                      imgs[imgIdx] = { ...img, caption: e.target.value };
                      onChange({ ...block, images: imgs });
                    }}
                    placeholder="Caption (optional)"
                    className="w-full rounded-lg border bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--text)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onImageRemove(imgIdx)}
                  className="flex-shrink-0 rounded-full p-1 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
                  aria-label="Remove image"
                >✕</button>
              </div>
            ))}
            {(block.images || []).length < MAX_SECTION_IMAGES && (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={onImageUpload}
                />
                + Upload image <span className="opacity-60">(max {MAX_IMAGE_MB}MB)</span>
              </label>
            )}
            {uploadStatus && <p className="text-xs text-[var(--muted)]">{uploadStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectCaseStudyEditor({ project, onSave, onClose }) {
  const [sections, setSections] = useState(() => {
    const saved = project?.pageContent?.sections;
    return Array.isArray(saved) && saved.length > 0 ? saved : defaultProjectSections();
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({});
  const [extraBlockUploadStatus, setExtraBlockUploadStatus] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState("");

  const updateSection = useCallback((idx, updated) => {
    setSections((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
    setDirty(true);
  }, []);

  const addSection = (layout = "text-only") => {
    setSections((prev) => {
      setActiveIdx(prev.length);
      return [...prev, { ...createSection(""), layout }];
    });
    setDirty(true);
  };

  const moveGroup = (groupLabel, dir) => {
    setSections((prev) => {
      const seenLabels = new Set();
      const groupOrder = [];
      prev.forEach((s) => {
        const label = s.sectionLabel || "";
        if (!seenLabels.has(label)) { seenLabels.add(label); groupOrder.push(label); }
      });
      const idx = groupOrder.indexOf(groupLabel);
      if (idx === -1) return prev;
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= groupOrder.length) return prev;
      [groupOrder[idx], groupOrder[targetIdx]] = [groupOrder[targetIdx], groupOrder[idx]];
      const groupMap = new Map();
      prev.forEach((s) => {
        const label = s.sectionLabel || "";
        if (!groupMap.has(label)) groupMap.set(label, []);
        groupMap.get(label).push(s);
      });
      const newSections = groupOrder.flatMap((label) => groupMap.get(label) || []);
      const activeSectionId = prev[activeIdx]?.id;
      if (activeSectionId) {
        const newIdx = newSections.findIndex((s) => s.id === activeSectionId);
        if (newIdx !== -1) setActiveIdx(newIdx);
      }
      return newSections;
    });
    setDirty(true);
  };

  const addSectionToGroup = (groupLabel) => {
    setSections((prev) => {
      let insertAfter = -1;
      prev.forEach((s, i) => { if (s.sectionLabel === groupLabel) insertAfter = i; });
      const newSection = { ...createSection(""), sectionLabel: groupLabel };
      const next = [...prev];
      next.splice(insertAfter + 1, 0, newSection);
      setActiveIdx(insertAfter + 1);
      return next;
    });
    setDirty(true);
  };

  const removeSection = (idx) => {
    setSections((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setActiveIdx((a) => Math.max(0, Math.min(a, next.length - 1)));
      return next;
    });
    setDirty(true);
  };

  const moveSection = (idx, dir) => {
    setSections((prev) => {
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      setActiveIdx(target);
      return next;
    });
    setDirty(true);
  };

  const handleImageUpload = async (sectionIdx, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadStatus((prev) => ({ ...prev, [sectionIdx]: `File too large (max ${MAX_IMAGE_MB}MB)` }));
      return;
    }
    setUploadStatus((prev) => ({ ...prev, [sectionIdx]: "Uploading..." }));
    try {
      const url = await uploadToCloudinary(file);
      // Compute updated sections directly so we can save immediately —
      // the 800ms autosave timer is too slow to survive a page refresh.
      const updatedSections = sections.map((s, i) =>
        i === sectionIdx
          ? { ...s, images: [...s.images, { url, name: file.name, caption: "" }] }
          : s
      );
      setSections(updatedSections);
      const ok = onSaveRef.current({ ...projectRef.current, pageContent: { sections: updatedSections } });
      if (ok === false) {
        setSaveError("Image couldn't be saved — browser storage is full. Try a smaller image or remove other images first.");
      } else {
        setSaveError("");
      }
      setDirty(false);
      setUploadStatus((prev) => ({ ...prev, [sectionIdx]: "" }));
    } catch {
      setUploadStatus((prev) => ({ ...prev, [sectionIdx]: "Upload failed. Try again." }));
    }
  };

  const handleImageRemove = (sectionIdx, imgIdx) => {
    const updatedSections = sections.map((s, i) => {
      if (i !== sectionIdx) return s;
      const imgs = s.images.filter((_, j) => j !== imgIdx);
      return { ...s, images: imgs };
    });
    setSections(updatedSections);
    const ok = onSaveRef.current({ ...projectRef.current, pageContent: { sections: updatedSections } });
    if (ok === false) {
      setSaveError("Image couldn't be saved — browser storage is full. Try removing other images first.");
    } else {
      setSaveError("");
    }
    setDirty(false);
  };

  const addExtraBlock = (sectionIdx, layout) => {
    setSections((prev) => {
      const next = [...prev];
      const s = next[sectionIdx];
      next[sectionIdx] = { ...s, extraBlocks: [...(s.extraBlocks || []), createBlock(layout)] };
      return next;
    });
    setDirty(true);
  };

  const updateExtraBlock = (sectionIdx, blockIdx, updated) => {
    setSections((prev) => {
      const next = [...prev];
      const s = next[sectionIdx];
      const extraBlocks = [...(s.extraBlocks || [])];
      extraBlocks[blockIdx] = updated;
      next[sectionIdx] = { ...s, extraBlocks };
      return next;
    });
    setDirty(true);
  };

  const removeExtraBlock = (sectionIdx, blockIdx) => {
    setSections((prev) => {
      const next = [...prev];
      const s = next[sectionIdx];
      next[sectionIdx] = { ...s, extraBlocks: (s.extraBlocks || []).filter((_, i) => i !== blockIdx) };
      return next;
    });
    setDirty(true);
  };

  const handleExtraBlockImageUpload = async (sectionIdx, blockIdx, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const key = `${sectionIdx}-${blockIdx}`;
    if (file.size > MAX_IMAGE_BYTES) {
      setExtraBlockUploadStatus((prev) => ({ ...prev, [key]: `File too large (max ${MAX_IMAGE_MB}MB)` }));
      return;
    }
    setExtraBlockUploadStatus((prev) => ({ ...prev, [key]: "Uploading..." }));
    try {
      const url = await uploadToCloudinary(file);
      const updatedSections = sections.map((s, i) => {
        if (i !== sectionIdx) return s;
        const extraBlocks = [...(s.extraBlocks || [])];
        extraBlocks[blockIdx] = {
          ...extraBlocks[blockIdx],
          images: [...(extraBlocks[blockIdx].images || []), { url, name: file.name, caption: "" }],
        };
        return { ...s, extraBlocks };
      });
      setSections(updatedSections);
      const ok = onSaveRef.current({ ...projectRef.current, pageContent: { sections: updatedSections } });
      if (ok === false) {
        setSaveError("Image couldn't be saved — browser storage is full. Try a smaller image or remove other images first.");
      } else {
        setSaveError("");
      }
      setDirty(false);
      setExtraBlockUploadStatus((prev) => ({ ...prev, [key]: "" }));
    } catch {
      setExtraBlockUploadStatus((prev) => ({ ...prev, [key]: "Upload failed. Try again." }));
    }
  };

  const handleExtraBlockImageRemove = (sectionIdx, blockIdx, imgIdx) => {
    const updatedSections = sections.map((s, i) => {
      if (i !== sectionIdx) return s;
      const extraBlocks = [...(s.extraBlocks || [])];
      const imgs = (extraBlocks[blockIdx].images || []).filter((_, j) => j !== imgIdx);
      extraBlocks[blockIdx] = { ...extraBlocks[blockIdx], images: imgs };
      return { ...s, extraBlocks };
    });
    setSections(updatedSections);
    const ok = onSaveRef.current({ ...projectRef.current, pageContent: { sections: updatedSections } });
    if (ok === false) {
      setSaveError("Image couldn't be saved — browser storage is full. Try removing other images first.");
    } else {
      setSaveError("");
    }
    setDirty(false);
  };

  const [sliceStatus, setSliceStatus] = useState("");

  const handleFullDesignUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSliceStatus("Reading design… this may take a moment.");
    try {
      const dataUrl = await fileToDataUrl(file);
      // Strip "data:image/...;base64," prefix
      const [meta, imageBase64] = dataUrl.split(",");
      const mediaType = meta.replace("data:", "").replace(";base64", "");

      const response = await fetch("/api/parse-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || response.statusText);
      }

      const { sections: parsed } = await response.json();

      // Merge parsed content with fresh section shells (preserve id, leave images empty)
      const updated = parsed.map((s) => ({
        ...createSection(s.heading || ""),
        heading: s.heading || "",
        body: s.body || "",
        layout: s.layout || "text-only",
        meta: Array.isArray(s.meta) ? s.meta : [],
        cards: Array.isArray(s.cards) ? s.cards : [],
        images: [],
      }));

      setSections(updated);
      setActiveIdx(0);
      setDirty(true);
      setSliceStatus(`Done — ${updated.length} sections extracted.`);
      setTimeout(() => setSliceStatus(""), 4000);
    } catch (err) {
      setSliceStatus(`Error: ${err.message}`);
      setTimeout(() => setSliceStatus(""), 5000);
    }
  };

  const onSaveRef = useRef(onSave);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  const projectRef = useRef(project);
  useEffect(() => { projectRef.current = project; }, [project]);

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      onSaveRef.current({ ...projectRef.current, pageContent: { sections } });
      setDirty(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [sections, dirty]);

  const handleSave = () => {
    onSave({ ...project, pageContent: { sections } });
    setDirty(false);
  };

  const activeSection = sections[Math.min(activeIdx, sections.length - 1)];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-[var(--bg)] px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (dirty) {
                onSaveRef.current({ ...projectRef.current, pageContent: { sections } });
              }
              onClose();
            }}
            className="flex flex-shrink-0 items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="truncate text-sm font-medium">
            {project?.title || "Project"} — Page Editor
          </span>
          <span className={`flex-shrink-0 text-xs font-medium ${dirty ? "text-[var(--muted)]" : "text-[#4eada0]"}`}>
            {dirty ? "Saving…" : "✓ Auto-saved"}
          </span>
          {saveError && (
            <span className="flex-shrink-0 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              ⚠ {saveError}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Section list sidebar */}
        <div className="flex w-52 flex-shrink-0 flex-col border-r" style={{ background: "var(--panel-soft)" }}>
          <div className="space-y-2 border-b px-3 py-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--panel)] px-3 py-2 text-xs font-medium text-[var(--text)] shadow-sm transition hover:opacity-80">
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true">
                <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Upload full design
              <input
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={handleFullDesignUpload}
              />
            </label>
            {sliceStatus ? (
              <p className="px-1 text-[10px] text-[var(--muted)]">{sliceStatus}</p>
            ) : (
              <p className="px-1 text-[10px] text-[var(--muted)]">Extracts text into sections — add images later</p>
            )}
          </div>
          <div className="px-3 pb-2 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
              Structure
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1">
            {(() => {
              // Build grouped structure in order of first appearance
              const groupMap = new Map();
              sections.forEach((section, idx) => {
                const label = section.sectionLabel || "";
                if (!groupMap.has(label)) groupMap.set(label, []);
                groupMap.get(label).push({ section, idx });
              });
              const seenLabels = new Set();
              const groups = [];
              sections.forEach((section) => {
                const label = section.sectionLabel || "";
                if (!seenLabels.has(label)) {
                  seenLabels.add(label);
                  groups.push({ label, items: groupMap.get(label) });
                }
              });

              return groups.map((group, groupIdx) => (
                <div key={group.label || "__ungrouped"} className="mb-2">
                  {group.label && (
                    <div className="flex items-center gap-1 px-2 pb-0.5 pt-2">
                      <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-[#4eada0]">
                        {group.label}
                      </span>
                      <button type="button" onClick={() => moveGroup(group.label, -1)} disabled={groupIdx === 0} className="rounded p-0.5 text-[10px] text-[#4eada0] hover:bg-[var(--panel)] disabled:opacity-30" aria-label="Move group up">↑</button>
                      <button type="button" onClick={() => moveGroup(group.label, 1)} disabled={groupIdx === groups.length - 1} className="rounded p-0.5 text-[10px] text-[#4eada0] hover:bg-[var(--panel)] disabled:opacity-30" aria-label="Move group down">↓</button>
                    </div>
                  )}
                  {group.items.map(({ section, idx }) => (
                    <div
                      key={section.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`group flex cursor-pointer items-center gap-1.5 rounded-lg py-2 text-sm transition ${
                        group.label ? "pl-4 pr-2.5" : "px-2.5"
                      } ${
                        activeIdx === idx
                          ? "bg-[var(--text)] text-[var(--on-accent)]"
                          : "hover:bg-[var(--panel)]"
                      }`}
                    >
                      <span className="flex-1 truncate">
                        {section.heading || `Block ${idx + 1}`}
                      </span>
                      <div className={`flex gap-0.5 opacity-0 transition group-hover:opacity-100 ${activeIdx === idx ? "opacity-100" : ""}`}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(idx, -1); }} disabled={idx === 0} className="rounded p-0.5 text-[10px] hover:bg-white/20 disabled:opacity-30" aria-label="Move up">↑</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(idx, 1); }} disabled={idx === sections.length - 1} className="rounded p-0.5 text-[10px] hover:bg-white/20 disabled:opacity-30" aria-label="Move down">↓</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeSection(idx); }} className="rounded p-0.5 text-[10px] hover:bg-white/20" aria-label="Delete">✕</button>
                      </div>
                    </div>
                  ))}
                  {group.label && (
                    <button
                      type="button"
                      onClick={() => addSectionToGroup(group.label)}
                      className="ml-4 mt-0.5 w-[calc(100%-1.25rem)] rounded-lg border border-dashed px-2.5 py-1 text-left text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
                    >
                      + Add block
                    </button>
                  )}
                </div>
              ));
            })()}
          </div>

          <div className="border-t p-2">
            <button
              type="button"
              onClick={addSection}
              className="w-full rounded-lg border border-dashed px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
            >
              + New block
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {sections.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[var(--muted)]">Add a block from the left to get started.</p>
            </div>
          ) : activeSection ? (
            <>
              <SectionEditor
                section={activeSection}
                onChange={(updated) => updateSection(activeIdx, updated)}
                onImageUpload={(e) => handleImageUpload(activeIdx, e)}
                onImageRemove={(imgIdx) => handleImageRemove(activeIdx, imgIdx)}
                uploadStatus={uploadStatus[activeIdx]}
              />

              {(activeSection.extraBlocks || []).map((block, blockIdx) => (
                <div key={block.id} className="mt-10 border-t pt-8">
                  <ExtraBlockEditor
                    block={block}
                    onChange={(updated) => updateExtraBlock(activeIdx, blockIdx, updated)}
                    onRemove={() => removeExtraBlock(activeIdx, blockIdx)}
                    onImageUpload={(e) => handleExtraBlockImageUpload(activeIdx, blockIdx, e)}
                    onImageRemove={(imgIdx) => handleExtraBlockImageRemove(activeIdx, blockIdx, imgIdx)}
                    uploadStatus={extraBlockUploadStatus[`${activeIdx}-${blockIdx}`]}
                  />
                </div>
              ))}

              <div className="mt-10 border-t pt-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  + Add block
                </p>
                <div className="flex flex-wrap gap-2">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => addExtraBlock(activeIdx, opt.id)}
                      className="rounded-full border px-3 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}