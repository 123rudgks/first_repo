(() => {
  "use strict";

  const FALLBACK_COVER =
    "https://placehold.co/600x600/1428A0/FFFFFF?text=PLAY+MY+VIBE";

  const TRACKS = [
    {
      id: 1,
      title: "M",
      artist: "Princess Princess",
      vibe: "쓸쓸함 그리움",
      summary:
        "계절은 계속 바뀌지만, 헤어진 사람을 향한 마음만은 그 자리에 멈춰 있는 애절한 이별 노래.",
      story:
        "의무경찰 복무 시절, 후임에게 우연히 추천받아 알게 된 소중한 곡입니다. 눈이 쌓인 추운 겨울날, 긴장감 속에서 쓸쓸히 근무를 서며 이 노래를 종종 듣곤 했습니다.\n\n가장 기억에 남는 건 눈이 많이 내리던 날, 후임과 함께 경찰서 옥상에 올라가 눈사람을 만들고 옆에서 컵라면 끓여먹으면서 놀았던 순간입니다. 조금 유치할지 몰라도, 저는 이런 소소한 즐거움을 좋아하는것 같습니다.",
      hashtags: ["의무경찰", "소소한즐거움"],
      cover: "./assets/images/m.jpg",
      currentTime: "01:24",
      duration: "04:36",
      progress: 30,
    },
    {
      id: 2,
      title: "Out of Time",
      artist: "The Weeknd",
      vibe: "시티팝 몽환적",
      summary:
        "사랑할 준비가 너무 늦게 끝난 순간, 이미 시간이 다 지나버렸음을 깨닫는 노래",
      story:
        "이 노래는 위켄드가 Midnight Pretenders라는 일본의 아란 토모코 가수의 노래를 샘플링하여 만든 노래입니다. 저는 음악 장르 중에 시티팝이란 장르를 좋아하는데, 시티팝 위에 rnb 가수 멜로디가 섞이니까 독보적인 음악이 나온것 같습니다. 위켄드 노래 중에 제일 좋아하는 노래입니다.",
      hashtags: ["시티팝"],
      cover:
        "./assets/images/out of time.jpg",
      currentTime: "02:10",
      duration: "04:02",
      progress: 54,
    },
    {
      id: 3,
      title: "My Jinji",
      artist: "Sunset Rollercoaster",
      vibe: "몽환적 나른함",
      summary:
        "시간이 멈춰버린 듯한 밤, 사랑하는 사람에게 곁을 떠나지 말아 달라고 조용히 속삭이는 노래.",
      story:
        "이 노래는 친구랑 LP바를 갔을 때 친구가 선곡하여 처음 듣게 된 노래입니다. 저는 노을지는 날에 멍때리는 걸 좋아하는데 밴드의 이름 처럼 노을지는 날에 들으면 나른해지는 느낌이 듭니다. 주로 노을질때 2호선 타고 한강 건널때 들으면 갬성 폭발합니다.",
      hashtags: ["갬성", "노을", "LP바"],
      cover:
        "./assets/images/my jinji.jpg",
      currentTime: "00:58",
      duration: "03:24",
      progress: 29,
    },
    {
      id: 4,
      title: "Bubble Gum",
      artist: "New Jeans",
      vibe: "청량함 Y2K 감성",
      summary:
        "좋아하는 사람과 함께하는 순간이 풍선껌처럼 달콤하고 가볍게 부풀어 오르는 노래.",
      story:
        "원래 아이돌 음악을 선호하지 않는데 뉴진스의 음악은 다른 아이돌 음악과는 다르게 느껴져서 팬이 되었습니다. 뉴진스 노래 중에서 이 곡을 가장 좋아하며 인생 처음으로 앨범을 샀습니다. 이 앨범 이후에 뉴진스가 갑자기 사라져버려서 슬프네요. 최근에는 리센느가 조금씩 마음에 들어오고 있습니다.",
      hashtags: ["리센느", "야호"],
      cover:
        "./assets/images/bubblegum.jpg",
      currentTime: "01:15",
      duration: "03:17",
      progress: 38,
    },
    {
      id: 5,
      title: "한번더이별",
      artist: "성시경",
      vibe: "이별 추억",
      summary:
        "이미 헤어진 사람을 마음속에서 다시 떠나보내며, 끝난 사랑과 한 번 더 이별하는 노래.",
      story:
        "제가 제일 좋아하는 가수 중에 한명이 성시경인데 그 중에서도 제일 좋아하는 노래가 이 노래입니다. 처음에는 멜로디가 좋아서 들었지만 가사를 정독해본 이후에는 가사가 좋아서 듣게 되는것 같습니다.",
      hashtags: ["최애 가수", "좋은 가사"],
      cover:
        "./assets/images/한번더이별.jpg",
      currentTime: "03:02",
      duration: "04:35",
      progress: 66,
    },
  ];

  const state = {
    currentTrackIndex: 0,
    isVisuallyPlaying: true,
    lastFocusedElement: null,
    toastTimer: null,
  };

  const elements = {};

  function initialize() {
    cacheElements();
    bindEvents();
    renderTrackList();
    updatePlayer({ animate: false });
    updateVisualPlaybackUI();
    bindImageFallbacks(document);
  }

  function cacheElements() {
    elements.trackList = document.querySelector("#tracks-container");
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
    elements.equalizer = document.querySelector(".equalizer");
    elements.toast = document.querySelector("#toast-notification");
    elements.toastMessage = document.querySelector("#toast-message");
    elements.toastCloseButton = document.querySelector("#toast-close-button");
    elements.contactModal = document.querySelector("#contact-modal");
    elements.openContactButton = document.querySelector("#open-contact-modal");
    elements.modalPanel = elements.contactModal.querySelector(".modal__panel");
  }

  function bindEvents() {
    document.addEventListener("click", handleDocumentClick);
    elements.trackList.addEventListener("click", handleTrackListClick);
    elements.previousButton.addEventListener("click", showPreviousTrack);
    elements.nextButton.addEventListener("click", showNextTrack);
    elements.visualPlayButton.addEventListener("click", toggleVisualPlayState);
    elements.toastCloseButton.addEventListener("click", hideToast);
    elements.openContactButton.addEventListener("click", openContactModal);
    document.addEventListener("keydown", handleKeydown);
  }

  function handleDocumentClick(event) {
    const scrollTrigger = event.target.closest("[data-scroll-target]");

    if (scrollTrigger) {
      scrollToSection(scrollTrigger.dataset.scrollTarget);
      return;
    }

    if (event.target.closest("[data-modal-close]")) {
      closeContactModal();
    }
  }

  function handleTrackListClick(event) {
    const trackButton = event.target.closest("[data-track-index]");

    if (!trackButton) {
      return;
    }

    const trackIndex = Number(trackButton.dataset.trackIndex);
    selectTrack(trackIndex, { scroll: true });
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && !elements.contactModal.hidden) {
      closeContactModal();
    }
  }

  function renderTrackList() {
    const fragment = document.createDocumentFragment();

    TRACKS.forEach((track, index) => {
      fragment.append(createTrackItem(track, index));
    });

    elements.trackList.replaceChildren(fragment);
    bindImageFallbacks(elements.trackList);
  }

  function createTrackItem(track, index) {
    const isSelected = index === state.currentTrackIndex;
    const button = document.createElement("button");

    button.type = "button";
    button.className = `track-item${isSelected ? " is-selected" : ""}`;
    button.dataset.trackIndex = String(index);
    button.setAttribute("aria-pressed", String(isSelected));

    const numberContent = isSelected
      ? `
        <span class="track-item__indicator" aria-label="현재 선택된 트랙">
          <span></span><span></span><span></span>
        </span>
      `
      : String(track.id).padStart(2, "0");

    button.innerHTML = `
      <span class="track-item__main">
        <span class="track-item__number">${numberContent}</span>

        <span class="track-item__cover">
          <img
            src="${track.cover}"
            data-fallback-src="${FALLBACK_COVER}"
            alt=""
          >
        </span>

        <span class="track-item__info">
          <span class="track-item__title">${track.title}</span>
          <span class="track-item__artist">${track.artist}</span>
        </span>
      </span>

      <span class="track-item__vibe">
        <span class="track-item__vibe-label">Vibe</span>
        <span class="track-item__vibe-text">${track.vibe}</span>
      </span>
    `;

    return button;
  }

  function selectTrack(index, options = {}) {
    const { scroll = false } = options;

    if (!Number.isInteger(index) || index < 0 || index >= TRACKS.length) {
      return;
    }

    state.currentTrackIndex = index;
    renderTrackList();
    updatePlayer({ animate: true });

    if (scroll) {
      scrollToSection("now-playing");
    }
  }

  function updatePlayer(options = {}) {
    const { animate = true } = options;
    const track = TRACKS[state.currentTrackIndex];

    if (animate) {
      elements.playerContent.classList.add("is-transitioning");
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
        bindImageFallbacks(elements.playerCover.parentElement);

        elements.playerContent.classList.remove("is-transitioning");
      },
      animate ? 180 : 0,
    );
  }

  function renderHashtags(hashtags) {
    const fragment = document.createDocumentFragment();

    hashtags.forEach((hashtag) => {
      const item = document.createElement("span");
      item.className = "hashtag";
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
        ? "마지막 인사로 이동"
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
      scrollToSection("outro");
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

    elements.playerDisc.classList.toggle("is-playing", isPlaying);
    elements.equalizer.classList.toggle("is-playing", isPlaying);
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
      elements.toast.classList.add("is-visible");
    });

    state.toastTimer = window.setTimeout(hideToast, 3000);
  }

  function hideToast() {
    window.clearTimeout(state.toastTimer);
    elements.toast.classList.remove("is-visible");

    window.setTimeout(() => {
      if (!elements.toast.classList.contains("is-visible")) {
        elements.toast.hidden = true;
      }
    }, 300);
  }

  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openContactModal() {
    state.lastFocusedElement = document.activeElement;
    elements.contactModal.hidden = false;
    document.body.classList.add("modal-open");

    const closeButton = elements.contactModal.querySelector("[data-modal-close]");
    closeButton?.focus();
  }

  function closeContactModal() {
    if (elements.contactModal.hidden) {
      return;
    }

    elements.contactModal.hidden = true;
    document.body.classList.remove("modal-open");
    state.lastFocusedElement?.focus();
  }

  function bindImageFallbacks(scope) {
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
