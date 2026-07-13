const MENU_ITEMS = [
  {
    id: "iam",
    label: "I AM",
    description: "앨범 커버",
    href: "./index.html",
    icon: '<path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
  },
  {
    id: "tracklist",
    label: "Track List",
    description: "다섯 곡",
    href: "./tracklist.html",
    icon: '<path d="M8 6h11M8 12h11M8 18h11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  },
  {
    id: "now-playing",
    label: "Now Playing",
    description: "나의 이야기",
    href: "./now-playing.html",
    icon: '<path d="M9 6.5v11l8-5.5-8-5.5Z" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  },
  {
    id: "outro",
    label: "Outro",
    description: "마무리",
    href: "./outro.html",
    icon: '<path d="M5 7.5h14M5 12h9M5 16.5h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="m16 15 3 2-3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  },
];

const ACTIVE_LINK_CLASSES = [
  "border-brand/20",
  "bg-brand",
  "text-white",
  "shadow-[0_0.7rem_1.4rem_rgba(20,40,160,0.2)]",
];
const DEFAULT_LINK_CLASSES = [
  "border-transparent",
  "text-ink/70",
  "hover:border-brand/10",
  "hover:bg-brand/[0.07]",
  "hover:text-brand",
];
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const STORAGE_KEY = "play-my-vibe-sidebar-collapsed";

class AppSidebar extends HTMLElement {
  constructor() {
    super();

    this.isDesktopCollapsed = false;
    this.isMobileOpen = false;
    this.lastFocusedElement = null;
    this.desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);

    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleNavigationClick = this.handleNavigationClick.bind(this);
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") {
      return;
    }

    this.dataset.initialized = "true";
    this.currentPage = this.getAttribute("current-page") || "iam";
    this.isDesktopCollapsed = this.readStoredDesktopState();

    this.render();
    this.cacheElements();
    this.bindEvents();
    this.syncUi();
  }

  disconnectedCallback() {
    this.toggleButton?.removeEventListener("click", this.handleToggleClick);
    this.overlay?.removeEventListener("click", this.handleOverlayClick);
    this.navigation?.removeEventListener("click", this.handleNavigationClick);
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    this.desktopMedia.removeEventListener("change", this.handleViewportChange);
    document.body.classList.remove("overflow-hidden");
  }

  render() {
    const menuMarkup = MENU_ITEMS.map((item) => {
      const isActive = item.id === this.currentPage;
      const stateClasses = isActive
        ? ACTIVE_LINK_CLASSES.join(" ")
        : DEFAULT_LINK_CLASSES.join(" ");
      const currentAttribute = isActive ? ' aria-current="page"' : "";

      return `
        <a
          class="sidebar-link group flex min-h-16 items-center gap-3 rounded-2xl border px-3.5 py-3 no-underline transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 lg:justify-start"
          href="${item.href}"
          title="${item.label}"
          data-sidebar-link
          data-page-id="${item.id}"
          ${currentAttribute}
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-xl ${isActive ? "bg-white/15" : "bg-brand/[0.08] group-hover:bg-brand/10"}" aria-hidden="true">
            <svg class="size-5" viewBox="0 0 24 24">${item.icon}</svg>
          </span>
          <span class="sidebar-label min-w-0 flex-1">
            <strong class="block overflow-hidden text-sm font-[850] text-ellipsis whitespace-nowrap">${item.label}</strong>
            <small class="mt-0.5 block overflow-hidden text-[0.7rem] font-[650] text-ellipsis whitespace-nowrap ${isActive ? "text-white/65" : "text-muted"}">${item.description}</small>
          </span>
          ${isActive ? '<span class="sidebar-label size-1.5 shrink-0 rounded-full bg-white" aria-hidden="true"></span>' : ""}
        </a>
      `.replace('class="sidebar-link ', `class="sidebar-link ${stateClasses} `);
    }).join("");

    this.innerHTML = `
      <button
        id="app-sidebar-overlay"
        class="pointer-events-none fixed inset-0 z-[60] cursor-default bg-ink/35 opacity-0 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
        type="button"
        aria-label="사이드바 닫기"
        tabindex="-1"
      ></button>

      <aside
        id="app-sidebar-panel"
        class="fixed inset-y-0 left-0 z-[70] flex w-72 -translate-x-full flex-col overflow-hidden border-r border-brand/10 bg-surface/95 shadow-[0_1rem_3rem_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-[width,transform] duration-300 ease-in-out lg:w-72 lg:translate-x-0"
        aria-label="Play My Vibe 페이지 내비게이션"
      >
        <div class="pointer-events-none absolute -top-16 -left-16 size-48 rounded-full bg-brand/[0.09] blur-3xl" aria-hidden="true"></div>
        <div class="pointer-events-none absolute right-[-5rem] bottom-20 size-44 rounded-full bg-brand-light/[0.08] blur-3xl" aria-hidden="true"></div>

        <header class="relative flex h-24 shrink-0 items-center border-b border-brand/[0.08] px-5">
          <a class="sidebar-brand flex min-w-0 items-center gap-3 text-inherit no-underline" href="./index.html" aria-label="Play My Vibe 첫 페이지로 이동">
            <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-sm font-black tracking-[-0.04em] text-white shadow-[0_0.55rem_1.1rem_rgba(20,40,160,0.22)]">PV</span>
            <span class="sidebar-label min-w-0">
              <strong class="block overflow-hidden text-sm font-black tracking-[-0.02em] text-ellipsis whitespace-nowrap">Play My Vibe</strong>
              <small class="mt-0.5 block overflow-hidden text-[0.67rem] font-bold tracking-[0.1em] text-ellipsis whitespace-nowrap text-brand uppercase">Mini Album</small>
            </span>
          </a>
        </header>

        <nav class="relative flex-1 overflow-y-auto px-3 py-5" aria-label="페이지 목록">
          <div class="grid gap-2" data-sidebar-navigation>
            ${menuMarkup}
          </div>
        </nav>

        <footer class="relative shrink-0 border-t border-brand/[0.08] p-4">
          <div class="sidebar-footer flex items-center gap-3 rounded-2xl bg-brand/[0.055] px-3 py-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-brand shadow-[0_0.25rem_0.7rem_rgba(20,40,160,0.08)]" aria-hidden="true">
              <svg class="size-4.5" viewBox="0 0 24 24">
                <path d="M4 14.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5M8 10l4 4 4-4M12 14V3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="sidebar-label min-w-0 text-[0.7rem] leading-5 font-[650] text-muted">메뉴를 통해 각 트랙과 이야기를 순서대로 감상해 보세요.</span>
          </div>
        </footer>
      </aside>

      <button
        id="app-sidebar-toggle"
        class="fixed top-4 left-4 z-[80] grid size-11 cursor-pointer place-items-center rounded-2xl border border-brand/15 bg-surface text-brand shadow-[0_0.65rem_1.5rem_rgba(15,23,42,0.14)] transition-[left,background-color,color,transform] duration-300 hover:scale-105 hover:bg-brand hover:text-white active:scale-95 lg:left-[15.75rem]"
        type="button"
        aria-controls="app-sidebar-panel"
        aria-expanded="true"
        aria-label="사이드바 닫기"
      >
        <svg class="size-5" viewBox="0 0 24 24" aria-hidden="true" data-toggle-icon>
          <path d="m14 7-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
  }

  cacheElements() {
    this.panel = this.querySelector("#app-sidebar-panel");
    this.overlay = this.querySelector("#app-sidebar-overlay");
    this.toggleButton = this.querySelector("#app-sidebar-toggle");
    this.toggleIcon = this.querySelector("[data-toggle-icon]");
    this.navigation = this.querySelector("[data-sidebar-navigation]");
    this.brand = this.querySelector(".sidebar-brand");
    this.pageShell = document.querySelector("[data-page-shell]");
    this.labels = Array.from(this.querySelectorAll(".sidebar-label"));
    this.links = Array.from(this.querySelectorAll(".sidebar-link"));
  }

  bindEvents() {
    this.toggleButton.addEventListener("click", this.handleToggleClick);
    this.overlay.addEventListener("click", this.handleOverlayClick);
    this.navigation.addEventListener("click", this.handleNavigationClick);
    document.addEventListener("keydown", this.handleDocumentKeydown);
    this.desktopMedia.addEventListener("change", this.handleViewportChange);
  }

  handleToggleClick() {
    if (this.desktopMedia.matches) {
      this.isDesktopCollapsed = !this.isDesktopCollapsed;
      this.storeDesktopState();
    } else if (this.isMobileOpen) {
      this.closeMobileSidebar({ restoreFocus: false });
      return;
    } else {
      this.lastFocusedElement = document.activeElement;
      this.isMobileOpen = true;
    }

    this.syncUi();

    if (!this.desktopMedia.matches && this.isMobileOpen) {
      window.setTimeout(() => {
        const currentLink = this.querySelector('[aria-current="page"]');
        currentLink?.focus();
      }, 320);
    }
  }

  handleOverlayClick() {
    this.closeMobileSidebar();
  }

  handleNavigationClick(event) {
    const link = event.target.closest("a[data-sidebar-link]");

    if (!link || this.desktopMedia.matches) {
      return;
    }

    this.isMobileOpen = false;
    document.body.classList.remove("overflow-hidden");
  }

  handleDocumentKeydown(event) {
    if (!this.isMobileOpen || this.desktopMedia.matches) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeMobileSidebar();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = [
      this.toggleButton,
      ...Array.from(
        this.panel.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ),
    ].filter((element) => !element.hidden);

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  handleViewportChange() {
    if (this.desktopMedia.matches) {
      this.isMobileOpen = false;
      document.body.classList.remove("overflow-hidden");
    }

    this.syncUi();
  }

  closeMobileSidebar(options = {}) {
    const { restoreFocus = true } = options;

    if (!this.isMobileOpen) {
      return;
    }

    this.isMobileOpen = false;
    this.syncUi();

    if (restoreFocus) {
      (this.lastFocusedElement || this.toggleButton).focus();
    }
  }

  syncUi() {
    const isDesktop = this.desktopMedia.matches;
    const isExpanded = isDesktop
      ? !this.isDesktopCollapsed
      : this.isMobileOpen;

    this.panel.classList.toggle("-translate-x-full", !this.isMobileOpen);
    this.panel.classList.toggle("translate-x-0", this.isMobileOpen);
    this.panel.classList.toggle("lg:w-20", this.isDesktopCollapsed);
    this.panel.classList.toggle("lg:w-72", !this.isDesktopCollapsed);

    this.overlay.classList.toggle("pointer-events-none", !this.isMobileOpen);
    this.overlay.classList.toggle("opacity-0", !this.isMobileOpen);
    this.overlay.classList.toggle("pointer-events-auto", this.isMobileOpen);
    this.overlay.classList.toggle("opacity-100", this.isMobileOpen);
    this.overlay.tabIndex = this.isMobileOpen ? 0 : -1;

    this.toggleButton.classList.toggle("left-4", !this.isMobileOpen);
    this.toggleButton.classList.toggle("left-[14.75rem]", this.isMobileOpen);
    this.toggleButton.classList.toggle("lg:left-[1.125rem]", this.isDesktopCollapsed);
    this.toggleButton.classList.toggle("lg:left-[15.75rem]", !this.isDesktopCollapsed);

    this.labels.forEach((label) => {
      label.classList.toggle("lg:hidden", this.isDesktopCollapsed);
    });

    this.brand.classList.toggle("lg:invisible", this.isDesktopCollapsed);

    this.links.forEach((link) => {
      link.classList.toggle("lg:justify-center", this.isDesktopCollapsed);
      link.classList.toggle("lg:px-0", this.isDesktopCollapsed);
      link.classList.toggle("lg:justify-start", !this.isDesktopCollapsed);
    });

    if (this.pageShell) {
      this.pageShell.classList.toggle("lg:pl-20", this.isDesktopCollapsed);
      this.pageShell.classList.toggle("lg:pl-72", !this.isDesktopCollapsed);
    }

    document.body.classList.toggle(
      "overflow-hidden",
      !isDesktop && this.isMobileOpen,
    );

    this.toggleButton.setAttribute("aria-expanded", String(isExpanded));
    this.toggleButton.setAttribute(
      "aria-label",
      isExpanded ? "사이드바 닫기" : "사이드바 열기",
    );

    this.updateToggleIcon({ isDesktop, isExpanded });
  }

  updateToggleIcon({ isDesktop, isExpanded }) {
    let path;

    if (!isDesktop) {
      path = isExpanded
        ? '<path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
        : '<path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    } else {
      path = isExpanded
        ? '<path d="m14 7-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="m10 7 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    this.toggleIcon.innerHTML = path;
  }

  readStoredDesktopState() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  storeDesktopState() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(this.isDesktopCollapsed),
      );
    } catch {
      // Storage may be unavailable in restrictive browser contexts.
    }
  }
}

if (!customElements.get("app-sidebar")) {
  customElements.define("app-sidebar", AppSidebar);
}
