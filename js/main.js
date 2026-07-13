import "./components/sidebar.js";
import { FALLBACK_COVER, TRACKS } from "./data/tracks.js";

(() => {
  "use strict";

  const TRACK_ITEM_CLASSES =
    "group grid w-full grid-cols-[auto_1fr] gap-3.5 rounded-2xl border border-transparent bg-white/40 p-4 text-left no-underline transition-[background-color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-brand/10 hover:bg-brand/[0.04] hover:shadow-[0_0.65rem_1.5rem_rgba(20,40,160,0.07)] focus-visible:border-brand/20 focus-visible:bg-surface md:grid-cols-[minmax(0,1fr)_10rem] md:items-center md:px-6";
  const HASHTAG_CLASSES =
    "rounded-xl border border-brand/10 bg-surface px-3.5 py-1.5 text-[0.82rem] font-[750] text-brand shadow-[0_0.25rem_0.6rem_rgba(20,40,160,0.05)]";
  const STORY_TRANSITION_CLASSES = ["translate-y-[0.9rem]", "opacity-0"];
  const TOAST_VISIBLE_CLASSES = ["translate-y-0", "opacity-100"];
  const RECORD_SPIN_CLASS = "animate-record-spin";
  const EQUALIZER_ANIMATION_CLASSES = [
    "animate-equalizer-1",
    "animate-equalizer-2",
    "animate-equalizer-3",
    "animate-equalizer-4",
  ];

  const state = {
    currentTrackIndex: 0,
    isVisuallyPlaying: true,
    lastFocusedElement: null,
    toastTimer: null,
  };

  const elements = {};

  function initialize() {
    bindImageFallbacks(document);

    switch (document.body.dataset.page) {
      case "tracklist":
        initializeTrackListPage();
        break;
      case "now-playing":
        initializeNowPlayingPage();
        break;
      case "outro":
        initializeOutroPage();
        break;
      default:
        break;
    }
  }

  function initializeTrackListPage() {
    elements.trackList = document.querySelector("#tracks-container");

    if (!elements.trackList) {
      return;
    }

    renderTrackList();
  }

  function renderTrackList() {
    const fragment = document.createDocumentFragment();

    TRACKS.forEach((track) => {
      fragment.append(createTrackItem(track));
    });

    elements.trackList.replaceChildren(fragment);
    bindImageFallbacks(elements.trackList);
  }

  function createTrackItem(track) {
    const link = document.createElement("a");

    link.className = TRACK_ITEM_CLASSES;
    link.href = `./now-playing.html?track=${encodeURIComponent(track.id)}`;
    link.setAttribute(
      "aria-label",
      `${track.title}, ${track.artist}의 이야기를 Now Playing 페이지에서 보기`,
    );

    link.innerHTML = `
      <span class="grid min-w-0 grid-cols-[2.5rem_3rem_minmax(0,1fr)] items-center md:grid-cols-[3rem_4rem_minmax(0,1fr)]">
        <span class="text-center text-[0.9rem] font-[750] text-muted transition-colors duration-200 group-hover:text-brand">${String(track.id).padStart(2, "0")}</span>

        <span class="aspect-square w-11 overflow-hidden rounded-[0.7rem] border border-brand/10 bg-canvas shadow-[0_0.2rem_0.55rem_rgba(15,23,42,0.07)] md:w-12">
          <img
            class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            src="${track.cover}"
            data-fallback-src="${FALLBACK_COVER}"
            alt=""
          >
        </span>

        <span class="min-w-0 pl-3">
          <span class="block overflow-hidden text-[clamp(0.98rem,2vw,1.08rem)] font-extrabold text-ellipsis whitespace-nowrap text-ink transition-colors duration-200 group-hover:text-brand">${track.title}</span>
          <span class="mt-0.5 block overflow-hidden text-[0.8rem] text-ellipsis whitespace-nowrap text-muted">${track.artist}</span>
        </span>
      </span>

      <span class="col-start-2 flex min-w-0 items-center gap-2 pl-[3.7rem] text-[0.82rem] font-bold text-muted md:col-auto md:justify-end md:pl-0 md:text-right">
        <span class="rounded-[0.35rem] bg-brand/[0.08] px-2 py-0.5 text-[0.62rem] tracking-[0.08em] text-brand uppercase md:hidden">Vibe</span>
        <span class="block overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-200 group-hover:text-brand">${track.vibe}</span>
      </span>
    `;

    return link;
  }

  function initializeNowPlayingPage() {
    cachePlayerElements();

    if (!hasRequiredPlayerElements()) {
      return;
    }

    state.currentTrackIndex = getTrackIndexFromUrl();
    bindPlayerEvents();
    updatePlayer({ animate: false });
    updateVisualPlaybackUI();
  }

  function cachePlayerElements() {
    elements.playerContent = document.querySelector("#np-content-area");
    elements.playerCover = document.querySelector("#np-cover");
    elements.playerTitle = document.querySelector("#np-title");
    elements.playerArtist = document.querySelector("#np-artist");
    elements.playerCurrentTime = document.querySelector("#np-time-current");
    elements.playerTotalTime = document.querySelector("#np-time-total");
    elements.playerProgressFill = document.querySelector("#np-progress-fill");
    elements.playerProgressThumb = document.querySelector("#np-progress-thumb");
    elements.playerVibe = document.querySelector("#np-vibe-badge span");
    elements.playerSummary = document.querySelector("#np-summary");
    elements.playerStory = document.querySelector("#np-story");
    elements.playerHashtags = document.querySelector("#np-hashtags");
    elements.previousButton = document.querySelector("#previous-track-button");
    elements.nextButton = document.querySelector("#next-track-button");
    elements.visualPlayButton = document.querySelector("#visual-play-button");
    elements.visualPlayIcon = document.querySelector("#visual-play-icon");
    elements.playerDisc = document.querySelector("#player-disc");
    elements.equalizer = document.querySelector("#equalizer");
    elements.toast = document.querySelector("#toast-notification");
    elements.toastMessage = document.querySelector("#toast-message");
    elements.toastCloseButton = document.querySelector("#toast-close-button");
  }

  function hasRequiredPlayerElements() {
    return [
      elements.playerContent,
      elements.playerCover,
      elements.playerTitle,
      elements.playerArtist,
      elements.playerCurrentTime,
      elements.playerTotalTime,
      elements.playerProgressFill,
      elements.playerProgressThumb,
      elements.playerVibe,
      elements.playerSummary,
      elements.playerStory,
      elements.playerHashtags,
      elements.previousButton,
      elements.nextButton,
      elements.visualPlayButton,
      elements.visualPlayIcon,
      elements.playerDisc,
      elements.equalizer,
      elements.toast,
      elements.toastMessage,
      elements.toastCloseButton,
    ].every(Boolean);
  }

  function bindPlayerEvents() {
    elements.previousButton.addEventListener("click", showPreviousTrack);
    elements.nextButton.addEventListener("click", showNextTrack);
    elements.visualPlayButton.addEventListener("click", toggleVisualPlayState);
    elements.toastCloseButton.addEventListener("click", hideToast);
    window.addEventListener("popstate", handlePlayerHistoryChange);
  }

  function getTrackIndexFromUrl() {
    const requestedTrackId = Number(
      new URLSearchParams(window.location.search).get("track"),
    );
    const requestedIndex = TRACKS.findIndex(
      (track) => track.id === requestedTrackId,
    );

    return requestedIndex >= 0 ? requestedIndex : 0;
  }

  function handlePlayerHistoryChange() {
    selectTrack(getTrackIndexFromUrl(), { animate: true, updateUrl: false });
  }

  function selectTrack(index, options = {}) {
    const { animate = true, updateUrl = true } = options;

    if (!Number.isInteger(index) || index < 0 || index >= TRACKS.length) {
      return;
    }

    state.currentTrackIndex = index;
    updatePlayer({ animate });

    if (updateUrl) {
      updateTrackQueryParameter(TRACKS[index].id);
    }
  }

  function updateTrackQueryParameter(trackId) {
    const url = new URL(window.location.href);
    url.searchParams.set("track", String(trackId));
    window.history.pushState({ trackId }, "", url);
  }

  function updatePlayer(options = {}) {
    const { animate = true } = options;
    const track = TRACKS[state.currentTrackIndex];

    if (animate) {
      elements.playerContent.classList.add(...STORY_TRANSITION_CLASSES);
    }

    window.setTimeout(
      () => {
        elements.playerCover.src = track.cover;
        elements.playerCover.alt = `${track.title} 트랙 커버`;
        elements.playerTitle.textContent = track.title;
        elements.playerArtist.textContent = track.artist;
        elements.playerCurrentTime.textContent = track.currentTime;
        elements.playerTotalTime.textContent = track.duration;
        elements.playerProgressFill.style.width = `${track.progress}%`;
        elements.playerProgressThumb.style.left = `${track.progress}%`;
        elements.playerVibe.textContent = `대표 키워드 · ${track.vibe}`;
        elements.playerSummary.textContent = track.summary;
        elements.playerStory.textContent = track.story;

        renderHashtags(track.hashtags);
        updateNavigationButtons();
        bindImageFallbacks(elements.playerCover);
        elements.playerContent.classList.remove(...STORY_TRANSITION_CLASSES);
      },
      animate ? 180 : 0,
    );
  }

  function renderHashtags(hashtags) {
    const fragment = document.createDocumentFragment();

    hashtags.forEach((hashtag) => {
      const item = document.createElement("span");
      item.className = HASHTAG_CLASSES;
      item.textContent = `#${hashtag}`;
      fragment.append(item);
    });

    elements.playerHashtags.replaceChildren(fragment);
  }

  function updateNavigationButtons() {
    elements.previousButton.disabled = state.currentTrackIndex === 0;
    elements.nextButton.setAttribute(
      "aria-label",
      state.currentTrackIndex === TRACKS.length - 1
        ? "Outro 페이지로 이동"
        : "다음 트랙",
    );
  }

  function showPreviousTrack() {
    if (state.currentTrackIndex === 0) {
      return;
    }

    selectTrack(state.currentTrackIndex - 1);
  }

  function showNextTrack() {
    const isLastTrack = state.currentTrackIndex === TRACKS.length - 1;

    if (isLastTrack) {
      window.location.href = "./outro.html";
      return;
    }

    selectTrack(state.currentTrackIndex + 1);
  }

  function toggleVisualPlayState() {
    state.isVisuallyPlaying = !state.isVisuallyPlaying;
    updateVisualPlaybackUI();

    showToast(
      state.isVisuallyPlaying
        ? "음악이 가상 재생 중입니다. 실제 음원은 재생되지 않습니다."
        : "시각적 재생을 일시정지했습니다.",
    );
  }

  function updateVisualPlaybackUI() {
    const isPlaying = state.isVisuallyPlaying;

    elements.playerDisc.classList.toggle(RECORD_SPIN_CLASS, isPlaying);
    Array.from(elements.equalizer.children).forEach((bar, index) => {
      bar.classList.toggle(EQUALIZER_ANIMATION_CLASSES[index], isPlaying);
    });
    elements.visualPlayButton.setAttribute("aria-pressed", String(isPlaying));
    elements.visualPlayButton.setAttribute(
      "aria-label",
      isPlaying ? "가상 재생 일시정지" : "가상 재생 시작",
    );
    elements.visualPlayIcon.setAttribute(
      "href",
      isPlaying ? "#icon-pause" : "#icon-play",
    );
  }

  function showToast(message) {
    window.clearTimeout(state.toastTimer);

    elements.toastMessage.textContent = message;
    elements.toast.hidden = false;

    requestAnimationFrame(() => {
      elements.toast.classList.add(...TOAST_VISIBLE_CLASSES);
    });

    state.toastTimer = window.setTimeout(hideToast, 3000);
  }

  function hideToast() {
    window.clearTimeout(state.toastTimer);
    elements.toast.classList.remove(...TOAST_VISIBLE_CLASSES);

    window.setTimeout(() => {
      if (!elements.toast.classList.contains("opacity-100")) {
        elements.toast.hidden = true;
      }
    }, 300);
  }

  function initializeOutroPage() {
    elements.contactModal = document.querySelector("#contact-modal");
    elements.openContactButton = document.querySelector("#open-contact-modal");

    if (!elements.contactModal || !elements.openContactButton) {
      return;
    }

    elements.openContactButton.addEventListener("click", openContactModal);
    elements.contactModal.addEventListener("click", handleModalClick);
    document.addEventListener("keydown", handleModalKeydown);
  }

  function handleModalClick(event) {
    if (event.target.closest("[data-modal-close]")) {
      closeContactModal();
    }
  }

  function handleModalKeydown(event) {
    if (elements.contactModal.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeContactModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      elements.contactModal.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
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

  function openContactModal() {
    state.lastFocusedElement = document.activeElement;
    elements.contactModal.hidden = false;
    document.body.classList.add("overflow-hidden");

    const closeButton = elements.contactModal.querySelector("[data-modal-close]");
    closeButton?.focus();
  }

  function closeContactModal() {
    if (elements.contactModal.hidden) {
      return;
    }

    elements.contactModal.hidden = true;
    document.body.classList.remove("overflow-hidden");
    state.lastFocusedElement?.focus();
  }

  function bindImageFallbacks(scope) {
    if (!scope) {
      return;
    }

    const images =
      scope instanceof HTMLImageElement
        ? [scope]
        : Array.from(scope.querySelectorAll("img[data-fallback-src]"));

    images.forEach((image) => {
      if (image.dataset.fallbackBound === "true") {
        return;
      }

      image.dataset.fallbackBound = "true";
      image.addEventListener("error", () => {
        const fallbackSource = image.dataset.fallbackSrc || FALLBACK_COVER;

        if (image.getAttribute("src") !== fallbackSource) {
          image.setAttribute("src", fallbackSource);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
