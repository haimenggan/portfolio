const TEMPLATE_VERSION = "lina-singer-20260313-ac3";
const MEDIA_BASE = "/placeholders";
export const defaultPublishedSlug = "lina-live";

const mediaItem = (name) => ({
  type: "image",
  name,
  url: `${MEDIA_BASE}/${name}`,
});

export const defaultResumeTemplate = {
  __templateVersion: TEMPLATE_VERSION,
  name: "LINA",
  tagline: "独立唱作歌手，擅长电子流行、情绪叙事与现场舞台表达。",
  about:
    "LINA 是一名独立唱作歌手，作品游走在电子流行与抒情舞曲之间。她用电影感的歌词、克制的声线和层层推进的节奏去写夜色、海风、告别与重新出发。过去两年，她持续打磨单曲、舞台编排与视觉内容，希望把每一次演出都变成完整而有呼吸感的现场体验。",
  experiences:
    "2025 - 至今 | 独立唱作歌手 | LINA Studio | 持续发布单曲与现场影像，完成小型剧场演出、短视频 live session 与视觉企划。\n2024 - 2025 | 驻场主唱 | Blue Hour Live House | 以电子流行与抒情翻唱为核心曲目，建立稳定舞台风格与观众记忆点。\n2023 - 2024 | 词曲创作 / Demo 制作 | Midnight Room | 完成首张个人 EP 的词曲写作、编曲沟通与录音统筹。",
  skills:
    "唱作, 现场演出, 录音, 和声编写, 舞台编排, 视觉概念, 短视频 live session, 乐队排练, 情绪叙事, 电子流行",
  awards:
    "2025 | 巡演主视觉 Banner | Summer Blue Live Set | 用轮播图片展示现场海报、排练片段与舞台氛围。\n2024 | 单曲发行 Banner | Midnight Echo | 聚合单曲封面、幕后花絮与社交传播视觉。\n2024 | 媒体采访 Banner | City Pop Weekly | 展示人物照片、演出抓拍与主题视觉素材。",
  projects:
    "Midnight Echo | 电子流行单曲，围绕夜晚、告别与重新出发展开。\nBlue Hour Live Session | 以 live session 形式重组代表作品，强化现场呼吸感与镜头叙事。\nSea Fog EP | 三首歌组成的概念 EP，把海风、失眠与情绪回响写进合成器与鼓点里。\nAfterglow Stage Film | 结合舞台排练、动作设计与影像剪辑的短片式演出企划。",
  projectItems: [
    {
      period: "2024",
      title: "GenAI-Driven Workflows In Amazon Customer Care Center (AC3)",
      subtitle: "UX Design · Enterprise AI · Conversational UI",
      summary:
        "Redesigned Amazon's internal customer care workflows by embedding GenAI capabilities into agent tooling, reducing handle time and improving first-contact resolution across global support teams.",
      details:
        "Led end-to-end UX design for integrating generative AI into Amazon's Customer Care Center (AC3) platform. The project spanned discovery, workflow mapping, prototyping, and iterative testing with real agents to deliver a GenAI-assisted experience that felt natural, trustworthy, and measurably faster.",
      media: mediaItem("project-midnight.svg"),
      pageContent: {
        sections: [
          {
            id: "s-ac3-01",
            heading: "Overview",
            layout: "meta-split",
            meta: [
              { label: "Role", value: "Senior UX Designer" },
              { label: "Duration", value: "Jan 2024 – Aug 2024" },
              { label: "Team", value: "Amazon Customer Care (AC3)" },
              { label: "Platform", value: "Amazon Connect / Internal Tools" },
              { label: "Tools", value: "Figma, FigJam, UserTesting" },
            ],
            body: "Amazon's Customer Care Center (AC3) handles millions of customer contacts daily across voice, chat, and email channels. Agents rely on a suite of internal tools to look up order history, process returns, escalate issues, and draft responses — but these workflows are fragmented, slow, and require significant manual effort.\n\nThis project embedded GenAI capabilities directly into the agent workspace to surface suggested responses, auto-populate case details, summarize long contact histories, and guide agents through complex resolution paths — all without requiring them to leave their primary interface.",
            images: [],
            cards: [],
          },
          {
            id: "s-ac3-02",
            heading: "Problem",
            layout: "label-detail",
            body: "How might we reduce agent handle time and cognitive load while improving the quality and consistency of customer resolutions?",
            images: [],
            meta: [],
            cards: [
              {
                title: "Fragmented tooling",
                body: "Agents switched between 6+ internal tools per contact, losing context and adding time to every interaction.",
              },
              {
                title: "No intelligent assist",
                body: "Response drafting, policy lookup, and case categorization were entirely manual — even for common, repetitive contacts.",
              },
              {
                title: "Inconsistent quality",
                body: "Without guided workflows, response quality varied widely by agent experience level and shift, leading to re-contacts and escalations.",
              },
              {
                title: "High onboarding friction",
                body: "New agents required 6–8 weeks to reach productivity benchmarks due to tool complexity and knowledge gaps.",
              },
            ],
          },
          {
            id: "s-ac3-03",
            heading: "Discovery",
            layout: "label-cards",
            body: "",
            images: [],
            meta: [],
            cards: [
              {
                title: "Agent shadowing",
                body: "Observed 12 agents across 3 contact types (returns, delivery, account access). Documented tool-switching patterns and identified the highest-friction moments.",
              },
              {
                title: "Stakeholder interviews",
                body: "Interviewed operations leads, quality assurance, and workforce management to align on success metrics and constraints.",
              },
              {
                title: "Contact data analysis",
                body: "Analyzed 3 months of contact logs to identify the top 20 contact reasons accounting for 80% of volume — forming the basis for GenAI training priorities.",
              },
              {
                title: "Competitive benchmarking",
                body: "Reviewed AI-assisted support tooling at Salesforce, Zendesk, and Intercom to identify patterns worth adapting and anti-patterns to avoid.",
              },
            ],
          },
          {
            id: "s-ac3-04",
            heading: "Existing System",
            layout: "image-below",
            body: "Before this project, agents used a legacy split-screen interface: customer data on one side, a response editor on the other. All knowledge lookup happened in separate browser tabs. There was no inline guidance, no response suggestions, and no contact summarization.\n\nKey pain points identified in the existing system included excessive tab-switching, copy-paste errors between systems, inability to surface relevant policy at the right moment, and no way to hand off context when escalating.",
            images: [],
            meta: [],
            cards: [],
          },
          {
            id: "s-ac3-05",
            heading: "Vision",
            layout: "label-detail",
            body: "An intelligent agent workspace where GenAI works quietly in the background — surfacing what agents need, when they need it, without interrupting their flow or replacing their judgment.",
            images: [],
            meta: [],
            cards: [
              {
                title: "Ambient intelligence",
                body: "GenAI suggestions appear contextually, triggered by the active contact type — not as a separate step agents must initiate.",
              },
              {
                title: "Agent stays in control",
                body: "Every AI suggestion is editable and dismissible. Agents review and send — the system never acts autonomously on behalf of the agent.",
              },
              {
                title: "Explainable outputs",
                body: "Suggested responses show the policy or precedent they're based on, so agents can trust the output and learn from it over time.",
              },
              {
                title: "Progressive disclosure",
                body: "New agents see more structured guidance; experienced agents get lighter nudges. The interface adapts to proficiency level.",
              },
            ],
          },
          {
            id: "s-ac3-06",
            heading: "Design Exploration",
            layout: "image-below",
            body: "Early explorations focused on where and how to surface AI suggestions within the existing workspace without adding visual clutter. We tested three interaction models:\n\n1. Inline suggestion panel — AI suggestions appear below the response editor as the agent types.\n2. Side-drawer assist — A collapsible panel on the right surfaces suggestions on demand.\n3. Contextual overlay — Suggestions appear as a floating tooltip attached to the relevant field.\n\nAgent testing with low-fidelity prototypes strongly favored the inline panel approach for its predictability and low switching cost.",
            images: [],
            meta: [],
            cards: [],
          },
          {
            id: "s-ac3-07",
            heading: "Key Interactions",
            layout: "label-detail",
            body: "How might we make each AI touchpoint feel like a natural part of the agent's existing workflow rather than a bolt-on feature?",
            images: [],
            meta: [],
            cards: [
              {
                title: "Contact Summary",
                body: "On contact load, GenAI automatically generates a 2–3 sentence summary of the customer's history and reason for contact, saving agents 45–60 seconds of manual reading.",
              },
              {
                title: "Response Suggest",
                body: "As agents open the response editor, 2–3 suggested responses appear based on contact type, customer sentiment, and policy. Agents can accept, edit, or ignore.",
              },
              {
                title: "Policy Lookup",
                body: "Agents can highlight any phrase in the contact and trigger an inline policy lookup, returning the relevant policy excerpt without leaving the interface.",
              },
              {
                title: "Resolution Guide",
                body: "For complex contact types, a step-by-step resolution checklist appears in the sidebar, dynamically updating as the agent progresses through each step.",
              },
            ],
          },
          {
            id: "s-ac3-08",
            heading: "Final Design",
            layout: "image-below",
            body: "The final design unified the agent workspace into a single-surface experience: customer context on the left, response workspace in the center, and AI assist panel on the right. All three zones are persistently visible, and the AI panel updates contextually as the contact progresses.\n\nSpecial attention was paid to loading states, error handling when GenAI suggestions are unavailable, and graceful degradation for low-confidence outputs — all informed by agent feedback during usability testing.",
            images: [],
            meta: [],
            cards: [],
          },
          {
            id: "s-ac3-09",
            heading: "Impact",
            layout: "label-cards",
            body: "",
            images: [],
            meta: [],
            cards: [
              {
                title: "−18% Handle Time",
                body: "Average handle time dropped 18% across pilot agents in the first 30 days, driven primarily by faster response drafting and reduced tab-switching.",
              },
              {
                title: "+22% First Contact Resolution",
                body: "FCR improved by 22 percentage points for the top 5 contact types included in the GenAI pilot, reducing re-contacts and escalations.",
              },
              {
                title: "−40% Onboarding Time",
                body: "New agent ramp time to productivity benchmark dropped from 6–8 weeks to 3.5 weeks, attributed to in-context guidance and policy surfacing.",
              },
              {
                title: "4.4/5 Agent Satisfaction",
                body: "Post-pilot survey of 80 agents returned a 4.4/5 satisfaction score for the new workspace, with response assist and contact summary rated most valuable.",
              },
            ],
          },
          {
            id: "s-ac3-10",
            heading: "Takeaways",
            layout: "text-only",
            body: "This project reinforced that effective AI design in enterprise tools is as much about trust and control as it is about capability. Agents who felt the AI was working with them — not replacing them — adopted it quickly and used it consistently.\n\nThe highest-value insight from user research was that agents didn't want fewer decisions; they wanted better information at the moment of decision. GenAI excelled at surfacing that information in context.\n\nFuture opportunities include expanding the policy lookup to cover edge-case contact types, personalizing suggestion ranking based on individual agent resolution history, and extending the experience to supervisor tooling for real-time quality monitoring.",
            images: [],
            meta: [],
            cards: [],
          },
        ],
      },
    },
    {
      period: "2025",
      title: "Blue Hour Live Session",
      subtitle: "Live Session · Visual Performance",
      summary:
        "以 live session 的方式重组代表作品，把排练室、现场收音和镜头运动统一到一套情绪节奏里。",
      details:
        "这一组内容更强调现场呼吸感与人与空间的距离感：不是追求大而满的表演，而是在更克制的编排里，让人声、乐手和画面都留下足够的情绪余韵。",
      media: mediaItem("project-bluehour.svg"),
    },
    {
      period: "2024",
      title: "Sea Fog EP",
      subtitle: "EP · Night Stories",
      summary:
        "三首歌组成的概念 EP，把海风、失眠、回望与重启写进合成器、鼓点和低饱和色彩里。",
      details:
        "《Sea Fog》像一段完整的夜间旅程：从第一首歌的轻微不安，到第二首歌的自我对话，再到最后一首歌的重新出发，整张 EP 更像一场带有电影镜头感的城市漫游。",
      media: mediaItem("project-seafog.svg"),
    },
    {
      period: "2024",
      title: "Afterglow Stage Film",
      subtitle: "Stage Film · Motion Visual",
      summary:
        "把排练、动作设计、镜头语言与舞台灯光整合成一支短片式演出企划。",
      details:
        "这组视觉内容延续了 LINA 目前的舞台气质：安静、冷感、克制，但又保留足够明显的情绪起伏。它既是演出片段，也能作为单曲传播和社交平台内容的延展母体。",
      media: mediaItem("project-afterglow.svg"),
    },
  ],
  profilePosition: "独立唱作歌手 / Live Performer",
  profileEmail: "booking@lina-music.com",
  profileCustom1Title: "风格",
  profileCustom1Value: "电子流行、抒情舞曲、夜色叙事",
  profileCustom2Title: "演出",
  profileCustom2Value: "剧场专场、live house、品牌活动与影像化现场",
  profileCustom3Title: "合作",
  profileCustom3Value: "演出邀约、合作写歌、品牌联动与视觉企划",
  interactionAudio: null,
  aboutMedia: mediaItem("portrait-placeholder.svg"),
  mediaItems: [
    mediaItem("banner-stage.svg"),
    mediaItem("banner-portrait.svg"),
    mediaItem("banner-wave.svg"),
    mediaItem("banner-notes.svg"),
    mediaItem("banner-poster.svg"),
    mediaItem("banner-lights.svg"),
  ],
  customSections: [
    {
      title: "Live Visual Notes",
      content:
        "这里收录近阶段的艺人照片、live session 截图与舞台视觉，方便作为媒体包、演出海报和社交平台内容使用。",
      mediaItems: [
        mediaItem("banner-poster.svg"),
        mediaItem("banner-lights.svg"),
        mediaItem("project-midnight.svg"),
        mediaItem("project-bluehour.svg"),
      ],
    },
    {
      title: "Moodboard",
      content:
        "从排练室、海边、公路与冷暖光影提炼视觉气质，持续延展 LINA 的现场美学与内容封面语言。",
      mediaItems: [],
    },
  ],
};

export const defaultResumeTemplateVersion = TEMPLATE_VERSION;

function cloneItem(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

export function buildTemplateDraft(saved) {
  const base = cloneDefaultResumeTemplate();
  if (!saved || typeof saved !== "object") return base;

  if (saved.aboutMedia?.url) {
    base.aboutMedia = cloneItem(saved.aboutMedia);
  }

  if (Array.isArray(saved.mediaItems) && saved.mediaItems.length > 0) {
    base.mediaItems = saved.mediaItems.map((item) => cloneItem(item)).filter(Boolean);
  }

  if (saved.interactionAudio?.url) {
    base.interactionAudio = cloneItem(saved.interactionAudio);
  }

  if (Array.isArray(saved.projectItems) && saved.projectItems.length > 0) {
    base.projectItems = base.projectItems.map((item, index) => {
      const savedItem = saved.projectItems[index];
      if (!savedItem) return item;
      const merged = { ...item };
      if (savedItem.media?.url) merged.media = cloneItem(savedItem.media);
      if (savedItem.pageContent?.sections) merged.pageContent = cloneItem(savedItem.pageContent);
      return merged;
    });
  }

  if (Array.isArray(saved.customSections) && saved.customSections.length > 0) {
    base.customSections = base.customSections.map((section, index) => {
      const preservedMedia = saved.customSections[index]?.mediaItems;
      return Array.isArray(preservedMedia) && preservedMedia.length > 0
        ? { ...section, mediaItems: preservedMedia.map((item) => cloneItem(item)).filter(Boolean) }
        : section;
    });
  }

  return base;
}

function hasLegacyPlaceholderProjects(projectItems = []) {
  if (!Array.isArray(projectItems)) return false;
  const titles = projectItems.map((item) => String(item?.title || "").trim());
  return titles.includes("MotionCV Web") || titles.includes("Portfolio System");
}

export function shouldSeedImportedTemplate(saved) {
  if (!saved || typeof saved !== "object") return true;
  if (saved.__templateVersion === TEMPLATE_VERSION) return false;

  const name = String(saved.name || "").trim();
  const email = String(saved.profileEmail || saved.email || "").trim();
  const about = String(saved.about || "").trim();
  const experiences = String(saved.experiences || "").trim();
  const isEmpty = !name && !email && !about && !experiences;
  const isLegacyPlaceholder =
    about.includes("我专注于复杂产品的信息架构与体验优化") ||
    hasLegacyPlaceholderProjects(saved.projectItems);

  return isEmpty || isLegacyPlaceholder;
}

export function cloneDefaultResumeTemplate() {
  return JSON.parse(JSON.stringify(defaultResumeTemplate));
}
