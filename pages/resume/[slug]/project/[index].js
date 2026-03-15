import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { cloneDefaultResumeTemplate, defaultPublishedSlug } from "../../../../data/defaultResumeTemplate";
import { getResumeInLanguage } from "../../../../utils/resumeLanguage";
import { decodeResumeData, fetchCloudinaryResume, loadEditorDraft, loadPageContents, loadProjectMedia, loadResumeSnapshot } from "../../../../utils/shareResume";

function parseInline(text) {
  const parts = text.split(/(\*\*(?:[^*]|\*(?!\*))+\*\*|\*(?!\*)(?:[^*])+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part || null;
  });
}

function parseMarkdown(text, extraClass = "") {
  if (!text?.trim()) return null;
  const lines = text.split("\n");
  const blocks = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length) { blocks.push({ type: "ul", items: [...bulletBuffer] }); bulletBuffer = []; }
  };

  lines.forEach((line) => {
    if (line.trimStart().startsWith("- ")) {
      bulletBuffer.push(line.trimStart().slice(2));
    } else {
      flushBullets();
      if (line.trim()) blocks.push({ type: "p", content: line });
    }
  });
  flushBullets();

  return blocks.map((block, i) => {
    if (block.type === "ul") {
      return (
        <ul key={i} className={`list-disc pl-5 space-y-1 ${extraClass}`}>
          {block.items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
        </ul>
      );
    }
    return <p key={i} className={extraClass}>{parseInline(block.content)}</p>;
  });
}

function BlockContent({ block, headingEl }) {
  const { layout, heading = "", body = "", images = [] } = block;
  const description = block.description ?? "";
  const meta = block.meta ?? [];
  const cards = block.cards ?? [];
  const isTwoCol = layout === "label-cards" || layout === "label-detail";

  const bodyEl = body ? (
    <div className="space-y-5 text-[1.05rem] leading-8 text-[var(--muted)]">
      {parseMarkdown(body, "text-[1.05rem] leading-8 text-[var(--muted)]")}
    </div>
  ) : null;

  const imageEls = images.map((img, i) => (
    <figure key={i} className="w-full">
      <img src={img.url} alt={img.caption || img.name || ""} className="w-full h-auto" />
      {img.caption && (
        <figcaption className="mt-2.5 text-center text-xs text-[var(--muted)]">{img.caption}</figcaption>
      )}
    </figure>
  ));

  if (layout === "meta-split") return (
    <div className="grid gap-10 md:grid-cols-[200px_1fr] md:items-start">
      <div className="space-y-6">
        {meta.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-[var(--text)]">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)] whitespace-pre-line">{item.value}</p>
          </div>
        ))}
      </div>
      <div>{headingEl}{bodyEl}</div>
    </div>
  );

  if (layout === "label-story") return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr] md:items-start">
      <div>{headingEl}</div>
      <div className="space-y-4">
        {body && <p className="text-base font-semibold leading-snug text-[var(--text)]">{parseInline(body)}</p>}
        <div className="space-y-3 text-base leading-8 text-[var(--muted)]">
          {parseMarkdown(description, "text-base leading-8 text-[var(--muted)]")}
        </div>
        {images.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 3)}, 1fr)` }}>
            {images.map((img, i) => (
              <figure key={i}>
                <img src={img.url} alt={img.caption || img.name || ""} className="w-full h-auto" />
                {img.caption && <figcaption className="mt-1.5 text-center text-xs text-[var(--muted)]">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isTwoCol) return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr] md:items-start">
      <div>{headingEl}</div>
      <div>
        {layout === "label-cards" && (
          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((card, i) => (
              <div key={i}>
                {card.title && <p className="mb-1.5 font-semibold text-[var(--text)]">{card.title}</p>}
                <div className="space-y-2 text-sm leading-7 text-[var(--muted)]">
                  {parseMarkdown(card.body, "text-sm leading-7 text-[var(--muted)]")}
                </div>
              </div>
            ))}
          </div>
        )}
        {layout === "label-detail" && (
          <div className="space-y-6">
            {body && <p className="text-lg font-semibold leading-snug text-[var(--text)]">{body}</p>}
            {imageEls.length > 0 && <div className="space-y-4">{imageEls}</div>}
            {cards.length > 0 && (
              <div className="space-y-4">
                {cards.map((card, i) => (
                  <div key={i} className="space-y-1 text-sm leading-7 text-[var(--muted)]">
                    {card.title && <span className="font-semibold text-[var(--text)]">{card.title}: </span>}
                    {parseMarkdown(card.body, "text-sm leading-7 text-[var(--muted)]")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (layout === "vision") return (
    <div>
      {heading && (
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      {body && (
        <div className="space-y-4 text-2xl leading-relaxed" style={{ color: "#4eada0" }}>
          {parseMarkdown(body, "text-2xl leading-relaxed")}
        </div>
      )}
    </div>
  );

  if (layout === "text-only") return <>{headingEl}{bodyEl}</>;
  if (layout === "image-below") return <>{headingEl}{bodyEl}{imageEls.length > 0 && <div className="mt-8 space-y-6">{imageEls}</div>}</>;
  if (layout === "image-right") return (
    <div className="grid gap-10 md:grid-cols-2 md:items-start">
      <div>{headingEl}{bodyEl}</div>
      {imageEls.length > 0 && <div className="space-y-5">{imageEls}</div>}
    </div>
  );
  if (layout === "image-left") return (
    <div className="grid gap-10 md:grid-cols-2 md:items-start">
      {imageEls.length > 0 && <div className="space-y-5">{imageEls}</div>}
      <div>{headingEl}{bodyEl}</div>
    </div>
  );
  if (layout === "full-image") return <div className="space-y-6">{imageEls}</div>;
  return null;
}

function SectionBlock({ section, showGroupLabel }) {
  const { id, heading, layout, sectionLabel } = section;

  const headingEl = heading && !["label-cards", "label-detail"].includes(layout)
    ? <h2 className="mb-7 text-2xl font-semibold tracking-tight">{heading}</h2>
    : (heading ? <h2 className="text-2xl font-semibold leading-snug tracking-tight">{heading}</h2> : null);

  return (
    <section
      id={`section-${id}`}
      className="scroll-mt-24 border-b border-[var(--line)] py-12 last:border-0"
    >
      {sectionLabel && showGroupLabel && (
        <p className="mb-6 text-xs font-semibold tracking-[0.15em] uppercase text-[#4eada0]">
          {sectionLabel}
        </p>
      )}
      <BlockContent block={section} headingEl={headingEl} />
      {(section.extraBlocks || []).map((block) => (
        <div key={block.id} className="mt-10 pt-2">
          <BlockContent block={block} headingEl={null} />
        </div>
      ))}
    </section>
  );
}

function SectionNav({ sections, activeId }) {
  // Deduplicate: sections sharing a sectionLabel collapse to one nav item (the first)
  const seen = new Set();
  const navItems = sections
    .filter((s) => s.heading || s.sectionLabel)
    .filter((s) => {
      if (s.sectionLabel) {
        if (seen.has(s.sectionLabel)) return false;
        seen.add(s.sectionLabel);
      }
      return true;
    })
    .map((s) => ({
      id: s.id,
      label: s.sectionLabel || s.heading,
      // a section is "active" if it or any sibling sharing the same label is active
      groupIds: s.sectionLabel
        ? sections.filter((x) => x.sectionLabel === s.sectionLabel).map((x) => x.id)
        : [s.id],
    }));

  if (!navItems.length) return null;

  return (
    <aside className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <nav>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#section-${item.id}`}
                className={`block text-sm transition ${
                  item.groupIds.includes(activeId)
                    ? "font-medium text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default function ProjectPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const encoded = typeof router.query.data === "string" ? router.query.data : "";
  const lang = router.query.lang === "en" ? "en" : "zh";
  const indexParam = typeof router.query.index === "string" ? router.query.index : "0";
  const projectIndex = Math.max(0, parseInt(indexParam, 10) || 0);
  const ready = router.isReady;
  const [activeId, setActiveId] = useState("");

  const [cloudData, setCloudData] = useState(null);

  const { data, needsCloudFetch } = useMemo(() => {
    if (!ready) return { data: null, needsCloudFetch: false };
    if (encoded) {
      try {
        return { data: decodeResumeData(encoded), needsCloudFetch: false };
      } catch {
        return { data: null, needsCloudFetch: false };
      }
    }
    if (slug === defaultPublishedSlug) {
      const draft = loadEditorDraft();
      if (draft) {
        const pageContents = loadPageContents();
        const projectMedia = loadProjectMedia();
        const projectItems = (draft.projectItems || []).map((item, i) => ({
          ...item,
          media: projectMedia[i] ?? item.media,
          pageContent: pageContents[i] ?? item.pageContent,
        }));
        return { data: { ...cloneDefaultResumeTemplate(), ...draft, projectItems }, needsCloudFetch: false };
      }
    }
    const snapshot = loadResumeSnapshot(slug);
    if (snapshot) return { data: snapshot, needsCloudFetch: false };
    return { data: null, needsCloudFetch: true };
  }, [encoded, ready, slug]);

  useEffect(() => {
    if (!needsCloudFetch || !slug) return;
    let cancelled = false;
    fetchCloudinaryResume(slug).then((result) => {
      if (!cancelled) setCloudData(result ?? (slug === defaultPublishedSlug ? cloneDefaultResumeTemplate() : null));
    });
    return () => { cancelled = true; };
  }, [needsCloudFetch, slug]);

  const resolvedData = cloudData ?? data;
  const displayData = resolvedData ? getResumeInLanguage(resolvedData, lang) : null;
  const projectItems = Array.isArray(displayData?.projectItems) ? displayData.projectItems : [];
  const project = projectItems[projectIndex] ?? null;
  const sections = project?.pageContent?.sections ?? [];
  const resumeHref = `/resume/${slug}?lang=${lang}${encoded ? `&data=${encoded}` : ""}`;

  useEffect(() => {
    if (!sections.length) return undefined;
    const handleScroll = () => {
      // The "active" section is the last one whose top edge has scrolled above 25% of the viewport height
      const threshold = window.scrollY + window.innerHeight * 0.25;
      let bestId = sections[0]?.id ?? "";
      for (const section of sections) {
        const el = document.getElementById(`section-${section.id}`);
        if (!el) continue;
        if (el.offsetTop <= threshold) bestId = section.id;
      }
      setActiveId(bestId);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <>
      <Head>
        <title>
          {project?.title
            ? `${project.title}${displayData?.name ? ` — ${displayData.name}` : ""}`
            : "Project"}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* Sticky back header */}
        <header className="sticky top-0 z-50 border-b bg-[var(--bg)]/90 px-6 py-4 backdrop-blur-sm">
          <Link
            href={resumeHref}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path
                d="M12 15L7 10L12 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {lang === "en" ? "Back" : "返回"}
          </Link>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-14">
          {!ready || !project ? (
            <p className="text-[var(--muted)]">
              {lang === "en" ? "Project not found." : "未找到该项目。"}
            </p>
          ) : (
            <div>
              {/* Main content */}
              <div className="min-w-0">
                {/* Hero header */}
                <div className="mb-2">
                  {project.period && (
                    <p className="mb-3 text-sm font-semibold tracking-wider text-[var(--muted)]">
                      {project.period}
                    </p>
                  )}
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                    {project.title}
                  </h1>
                  {project.media && (
                    <div className="mt-10">
                      {project.media.type === "image" ? (
                        <img
                          src={project.media.url}
                          alt={project.media.name || project.title}
                          className="w-full h-auto"
                        />
                      ) : (
                        <video controls className="w-full">
                          <source src={project.media.url} />
                        </video>
                      )}
                    </div>
                  )}
                </div>

                {/* Page sections */}
                {sections.length > 0 ? (
                  <div className="mt-4 border-t border-[var(--line)]">
                    {(() => {
                      const seenLabels = new Set();
                      return sections.map((section) => {
                        const label = section.sectionLabel || "";
                        const showGroupLabel = label ? !seenLabels.has(label) : false;
                        if (label) seenLabels.add(label);
                        return <SectionBlock key={section.id} section={section} showGroupLabel={showGroupLabel} />;
                      });
                    })()}
                  </div>
                ) : (
                  <div className="mt-14 rounded-2xl border border-dashed p-10 text-center text-sm text-[var(--muted)]">
                    {lang === "en"
                      ? "No page content yet. Open the editor and click 'Edit Page' on this project to add sections."
                      : "暂无页面内容，请在编辑器中点击该项目的「编辑页面」按钮添加内容。"}
                  </div>
                )}
              </div>

            </div>
          )}
        </main>

        {/* Other case studies footer */}
        {ready && project && projectItems.filter((_, i) => i !== projectIndex).length > 0 && (
          <footer className="border-t border-[var(--line)] px-6 py-16">
            <div className="mx-auto max-w-5xl">
              <p className="mb-8 text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted)]">
                Other Projects
              </p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {projectItems
                  .map((item, i) => ({ item, i }))
                  .filter(({ i }) => i !== projectIndex)
                  .map(({ item, i }) => (
                    <Link
                      key={i}
                      href={`/resume/${slug}/project/${i}?lang=${lang}${encoded ? `&data=${encoded}` : ""}`}
                      className="group block"
                    >
                      <div className="mb-4 overflow-hidden bg-[var(--panel-soft)]">
                        {item.media?.url ? (
                          item.media.type === "image" ? (
                            <img
                              src={item.media.url}
                              alt={item.media.name || item.title}
                              className="h-48 w-full object-cover transition group-hover:opacity-90"
                            />
                          ) : (
                            <video className="h-48 w-full object-cover">
                              <source src={item.media.url} />
                            </video>
                          )
                        ) : (
                          <div className="h-48 w-full" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold leading-snug tracking-tight transition group-hover:text-[#4eada0]">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.subtitle}</p>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          </footer>
        )}


        {ready && project && (
          <SectionNav sections={sections} activeId={activeId} />
        )}
      </div>
    </>
  );
}